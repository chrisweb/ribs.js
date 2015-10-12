'use strict';

import ViewHelper = require('./viewHelper');
import Container = require('./container');
import Backbone = require('backbone');
import $ = require('jquery');
import _ = require('underscore');
import FSPromise = require('FSPromise');
import Promise = FSPromise.FSPromise;

class View extends Backbone.View<Backbone.Model> {

    static defaultOptions: Ribs.ViewOptions = {
        removeModelOnClose: true, // Boolean: If true, remove model from its collection on view close
        reRenderOnChange: false,
        listSelector: '.list',
        templateVariables: {},
        ModelView: null,
        ModelViewOptions: {},
        subviewAsyncRender: false
    };
    options: Ribs.ViewOptions;

    referenceModelView: { [selector: string]: { [cid: string]: Ribs.View } };
    isDispatch: boolean = false;
    template;

    private pendingViewModel: JQuery[];
    public pendingViewModelPromise: Thenable<JQuery>[];//readonly
    private waitingForSort: boolean;
    private waitingForUpdateCollection: boolean;
    private isCollectionRendered: boolean;
    private isSubviewRendered: boolean;
    private $previousEl: JQuery;
    private lastRenderPromise: FSPromise<JQuery>;
    private isCreating: boolean;
    private createPromise: Thenable<JQuery>;

    constructor(options?) {
        super(options);
    }

    initialize(options) {

        this.pendingViewModel = [];
        this.waitingForSort = false;
        this.waitingForUpdateCollection = false;
        this.isCollectionRendered = false;
        this.isSubviewRendered = false;
        this.isCreating = false;
        this.createPromise = null;

        this.pendingViewModelPromise = [];

        this.options = $.extend({}, View.defaultOptions, options || {});

        this.onInitializeStart();
            
        // collection children views, usefull when collection view gets
        // destroyed and we want to take some action on sub views
        this.referenceModelView = {};
        this.referenceModelView[this.options.listSelector] = {};

        if (this.collection !== undefined) {

            this.listenTo(this.collection, 'add', this.addModel);
            this.listenTo(this.collection, 'remove', this.removeModel);
            this.listenTo(this.collection, 'reset', this.reset);
            this.listenTo(this.collection, 'sort', this.sortModel);
            this.listenTo(this.collection, 'update', this.updateCollection);

        }

        if (this.model !== undefined) {

            this.listenTo(this.model, 'destroy', this.close);

            if (this.options.reRenderOnChange) {

                this.listenTo(this.model, 'change', this.reRenderModelView);

            }

        }

        this.onInitialize();

    }

    render() {

        this.onRenderStart();

        this.isCollectionRendered = false;
        this.isSubviewRendered = false;

        let htmlizeObject = this.htmlize();

        let doRender = ($renderedTemplate: JQuery): View|Thenable<View> => {

            this.setElement($renderedTemplate);

            this.onRender();

            this.isDispatch = true;
            this.lastRenderPromise = null;

            if (this.pendingViewModelPromise.length) {
                return Promise.all(this.pendingViewModelPromise).then(() => {
                    return this;
                });
            }

            if (this.waitingForUpdateCollection) {
                this._updateCollection();
                this.waitingForUpdateCollection = false;
            }

            return this;
        }

        if (htmlizeObject instanceof Promise) {

            if (!!this.lastRenderPromise) {
                this.lastRenderPromise.abort();
            }

            this.lastRenderPromise = htmlizeObject;

            return <any>htmlizeObject.then(doRender);

        }

        return doRender(<JQuery>htmlizeObject);

    }

    reRenderModelView() {

        this.onRenderStart();

        this.$previousEl = this.$el;
        let htmlizeObject = this.htmlize();

        let doRerender = ($renderedTemplate: JQuery): View|Thenable<View> => {

            this.$previousEl.replaceWith($renderedTemplate);
            this.$previousEl = null;
            this.setElement($renderedTemplate);

            this.onRender();
            this.lastRenderPromise = null;

            return this;
        }

        if (htmlizeObject instanceof Promise) {

            if (!!this.lastRenderPromise) {
                this.lastRenderPromise.abort();
            }
            this.lastRenderPromise = htmlizeObject;
            htmlizeObject.then(doRerender);
        } else {
            doRerender(<JQuery>htmlizeObject);
        }

    }

    private htmlizeView(): JQuery|Thenable<JQuery> {

        let templateKeyValues;

        let templateData = {};
        let postTemplateData = { _view: this };

        if (this.model !== undefined) {
            
            // model view
            // are there also templateVariables
            if (_.keys(this.options.templateVariables).length > 0) {

                templateKeyValues = $.extend(templateData, ViewHelper.get(), this.options.templateVariables, this.getModelAsJson(), postTemplateData);

            } else {

                templateKeyValues = $.extend(templateData, ViewHelper.get(), this.getModelAsJson(), postTemplateData);

            }


        } else if (_.keys(this.options.templateVariables).length > 0) {

            // templateVariables view
            templateKeyValues = $.extend(templateData, ViewHelper.get(), this.options.templateVariables, postTemplateData);

        } else {
                
            // basic view
            templateKeyValues = $.extend(templateData, ViewHelper.get(), postTemplateData);

        }

        let templateResult = this.template(templateKeyValues);

        if (templateResult instanceof Promise) {
            return templateResult;
        }

        return $(templateResult);

    }

    htmlize(): JQuery|Thenable<JQuery> {

        // is there a model or templateVariables or nothing?
        let viewHtml: JQuery|Thenable<JQuery> = this.htmlizeView();

        let doCollection = ($renderedTemplate: JQuery): JQuery|Thenable<JQuery> => {
            // and also a collection?
            this.isCollectionRendered = true;
            if (this.collection !== undefined) {
            
                // for each model of the collection append a modelView to
                // collection dom

                if (this.collection.models.length > 0) {

                    let promiseList: Thenable<JQuery>[] = [];

                    this.collection.models.forEach((model) => {

                        promiseList.push(this.addModel(model));

                    });

                    var $container = $renderedTemplate.find(this.options.listSelector);

                    if ($container.length === 0) {

                        if (($container = $renderedTemplate.filter(this.options.listSelector)).length === 0) {

                            $container = $();

                        }

                    }

                    return Promise.all(promiseList).then(() => {
                        this.updateCollection($container);
                        return $renderedTemplate;
                    });

                }

            }

            return $renderedTemplate;
        };

        let doSubView = ($renderedTemplate: JQuery): JQuery|Thenable<JQuery> => {

            this.isSubviewRendered = true;

            let promiseList = [];

            _.each(this.referenceModelView, (modelViewList, selector) => {
                if (selector === this.options.listSelector) {
                    return;
                }

                _.each(modelViewList, (modelView) => {

                    this.prepareAddedView(modelView);
                    promiseList.push(modelView.create());

                });

            });

            let allPromisesSubView = null;
            if (promiseList.length) {

                if (this.options.subviewAsyncRender) {
                    _.each(this.referenceModelView, (modelViewList, selector) => {
                        if (selector !== this.options.listSelector) {

                            this._addView(selector, Object.keys(modelViewList).map((cid) => { return modelViewList[cid] }), $renderedTemplate);

                        }
                    })
                } else {

                    allPromisesSubView = Promise.all(promiseList).then(() => {

                        let promiseAddView = [];

                        _.each(this.referenceModelView, (modelViewList, selector) => {
                            if (selector !== this.options.listSelector) {

                                promiseAddView.push(this._addView(selector, Object.keys(modelViewList).map((cid) => { return modelViewList[cid] }), $renderedTemplate));

                            }
                        })

                        if (promiseAddView.length) {
                            return Promise.all(promiseAddView).then(() => {
                                return $renderedTemplate;
                            });
                        }

                        return $renderedTemplate;
                    });
                }
            }

            if (allPromisesSubView !== null) {
                return allPromisesSubView;
            }

            return $renderedTemplate;

        };

        if (viewHtml instanceof Promise) {
            return (<Thenable<JQuery>>viewHtml).then(doCollection).then(doSubView);
        }

        let doCollectionView = doCollection(<JQuery>viewHtml);

        if (doCollectionView instanceof Promise) {
            return doCollectionView.then(doSubView);
        }

        return doSubView(<JQuery>doCollectionView);

    }

    getModelAsJson() {

        var data;

        if (this.model) {

            data = this.model.toJSON();

        }

        return data;

    }

    getCollectionAsJson() {

        var data;

        if (this.collection) {

            data = this.collection.toJSON();

        }

        return data;

    }

    close() {

        this.onCloseStart();

        if (this.referenceModelView !== null) {

            _.each(this.referenceModelView, (modelViewCollection: { [cid: string]: Ribs.View }, selector) => {

                _.each(modelViewCollection, (modelView) => {

                    this.onModelRemoved(modelView);

                    modelView.close();

                });

            });


            this.referenceModelView = {};

        }

        // remove the view from dom and stop listening to events that were
        // added with listenTo or that were added to the events declaration
        this.remove();
            
        // unbind events triggered from within views using backbone events
        this.unbind();

        if (this.model !== undefined && this.options) {

            if (this.options.removeModelOnClose === true && !!this.collection === true) {//!!this.model.collection === true) {
				
                this.collection.remove(this.model);
                //this.model.collection.remove(this.model);
				
            }

        }

        if (this.collection !== null) {
                
            // TODO: ...
                
                
        }

        this.onClose();

    }

    create(): JQuery|Thenable<JQuery> {

        if (this.isDispatch === true) {

            return this.$el;

        }

        if (this.isCreating === true) {

            return this.createPromise;

        }

        let renderObject = this.render();

        if (renderObject instanceof Promise) {

            this.isCreating = true;

            return this.createPromise = (<Thenable<View>>renderObject).then((view: View) => {
                this.isCreating = false;
                return this.$el;
            });

        }

        return this.$el;

    }

    clear() {

        Ribs.Container.clear(this.options.listSelector);

    }

    empty() {
            
        //Container.clear(this.options.listSelector);
            
        if (this.referenceModelView !== null) {

            _.each(this.referenceModelView, (modelViewList: { [cid: string]: Ribs.View }, selector) => {
                _.each(modelViewList, (modelView) => {

                    this.onModelRemoved(modelView);

                    modelView.close();

                });
            });

            this.referenceModelView = {};
            if ('listSelector' in this.options) {
                this.referenceModelView[this.options.listSelector] = {};
            }

        }

    }

    reset(collection) {

        this.removeUnusedModelView(collection);

        _.each(collection.models, (function (newModel) {

            this.addModel(newModel);

        }).bind(this));

        this.updateCollection();

    }

    removeUnusedModelView(collection) {

        collection = collection || this.collection;

        let collectionModelView = this.referenceModelView[this.options.listSelector];

        if (!collectionModelView) {
            return;
        }

        _.each(collectionModelView, (viewModel, cid) => {

            if (!collection.get(cid)) {

                viewModel.close();

                delete collectionModelView[cid];

            }

        });

    }

    private addModel(model): Thenable<JQuery> {

        if (this.isCollectionRendered === false) {
            return;
        }

        if (!(this.options.listSelector in this.referenceModelView)) {
            this.referenceModelView[this.options.listSelector] = {};
        }


        if (model.cid in this.referenceModelView[this.options.listSelector]) {

            var $element = this.referenceModelView[this.options.listSelector][model.cid].$el;

            this.pendingViewModel.push($element);

            return;

        }

        if (this.options.ModelView === null) {

            throw new Error('a collection view needs a ModelView passed on instantiation through the options');

        }

        let ModelView = this.options.ModelView;

        var mergedModelViewOptions = this.formatModelViewOptions($.extend({}, this.options.ModelViewOptions, { model: model, parentView: this }));

        var modelView = new ModelView(mergedModelViewOptions);

        let viewCreate = modelView.create();

        let doAddModel = ($element: JQuery): JQuery | Thenable<JQuery> => {

            this.pendingViewModel.push($element);

            // TODO: use the container to manage subviews of a list
            //Container.add(this.options.listSelector, modelView);

            if (!(this.options.listSelector in this.referenceModelView)) {
                this.referenceModelView[this.options.listSelector] = {};
            }

            this.referenceModelView[this.options.listSelector][model.cid] = modelView;

            this.onModelAdded(modelView);

            return $element;
        }

        if (viewCreate instanceof Promise) {
            this.pendingViewModelPromise.push(viewCreate);
            return viewCreate.then(doAddModel);
        }

        return Promise.resolve(doAddModel(<JQuery>viewCreate));

    }

    protected formatModelViewOptions(modelViewOptions): Ribs.ViewOptions {
        return modelViewOptions;
    }

    private removeModel(model) {

        var view = this.referenceModelView[this.options.listSelector][model.cid];

        if (view === undefined) {
            return view;
        }

        // TODO: use the container to manage subviews of a list
        //Container.remove(this.options.listSelector, view.container);
                
        view.close();
        
        /* No need anymore?
        if (view.$el !== undefined) {

            view.$el.detach();

        }*/

        delete this.referenceModelView[this.options.listSelector][model.cid];

        this.onModelRemoved(view);

        return view;

    }

    private sortModel($container: JQuery = null) {

        if (this.pendingViewModel.length || this.pendingViewModelPromise.length) {
            this.waitingForSort = true;
            return;
        }

        if (!($container instanceof $) || $container === null) {
            $container = this.$el.find(this.options.listSelector);

            if ($container.length === 0) {

                $container = this.$el.filter(this.options.listSelector);

                if ($container.length === 0) {

                    return;

                }

            }
        }

        // avoid lot of reflow and repaint.
        let displayCss = $container.css('display');
        $container.css('display', 'none');

        _.each(this.collection.models, (model) => {

            var modelView = this.referenceModelView[this.options.listSelector][model.cid];

            $container.append(modelView.$el);


        });

        $container.css('display', displayCss);

    }

    private updateCollection($container: JQuery = null) {
        if (this.pendingViewModelPromise.length) {
            Promise.all(this.pendingViewModelPromise).then(() => {
                this.pendingViewModelPromise = [];
                this._updateCollection($container)
            });
        } else {
            this._updateCollection($container);
        }
    }

    private _updateCollection($container: JQuery = null) {

        if (this.isDispatch === false) {
            this.waitingForUpdateCollection = true;
            return;
        }

        if ($container === null || !($container instanceof $)) {

            $container = this.$el.find(this.options.listSelector);

            if ($container.length === 0) {

                if (($container = this.$el.filter(this.options.listSelector)).length === 0) {

                    $container = $();

                }

            }

        }

        // avoid lot of reflow and repaint.
        let displayCss = $container.css('display');
        $container.css('display', 'none');

        $container.append(this.pendingViewModel);

        this.pendingViewModel.splice(0, this.pendingViewModel.length);

        if (this.waitingForSort) {
            this.sortModel($container);

            this.waitingForSort = false;
        }

        $container.css('display', displayCss);

    }

    public addView(selector: string|{ [selector: string]: Ribs.View|Ribs.View[] }, view: Ribs.View|Ribs.View[]) {

        let displayMode = this.$el.css('display');// Use css because some time show/hide use not expected display value
        this.$el.css('display', 'none');// Don't display to avoid reflow

        let returnView;

        if (typeof selector !== 'string') {
            returnView = {};
            _.each(selector, (viewList, selectorPath) => {
                returnView[selectorPath] = this._addView(selectorPath, viewList);
            });

        } else {

            returnView = this._addView(<string>selector, view);

        }

        this.$el.css('display', displayMode);

        return returnView;

    }

    private _addView(selector: string, view: Ribs.View|Ribs.View[], $el: JQuery = this.$el): JQuery|Thenable<JQuery>|(JQuery|Thenable<JQuery>)[] {

        if (!(selector in this.referenceModelView)) {
            this.referenceModelView[selector] = {};
        }

        let doAddView = (viewToAdd: Ribs.View): JQuery|Thenable<JQuery> => {

            this.referenceModelView[selector][viewToAdd.cid] = viewToAdd;

            if (this.isDispatch !== true && $el === this.$el) {
                return;
            }

            let $container = $el.find(selector);

            if ($container.length === 0) {

                if (($container = $el.filter(selector)).length === 0) {

                    $container = $();

                }

            }

            $container.append(viewToAdd.$el);

            if (viewToAdd.isDispatch === false) {
                let $oldEl = viewToAdd.$el;

                let newCreateView = viewToAdd.create();

                if (newCreateView instanceof Promise) {
                    return newCreateView.then(($renderNewCreate) => {

                        // Replace node only if previous element has parent
                        // Avoid some conflict with render override in class which extend Ribs.View
                        if ($oldEl.parent().length > 0) {
                            $oldEl.replaceWith($renderNewCreate);
                        }

                        return $renderNewCreate;
                    });
                } else {

                    $oldEl.replaceWith(<JQuery>newCreateView);

                    return <JQuery>newCreateView;
                }

            }

            return viewToAdd.$el;

        };

        if (view instanceof Array) {
            return view.map(doAddView);
        }

        return doAddView(<Ribs.View>view);
    }

    protected prepareAddedView(modelView: Ribs.View): Ribs.View {
        return modelView;
    }

    protected onInitialize() { }
    protected onInitializeStart() { }
    protected onRender() { }
    protected onRenderStart() { }
    protected onModelAdded(modelViewAdded: Ribs.View) { }
    protected onModelRemoved(modelViewRemoved: Ribs.View) { }
    protected onClose() { }
    protected onCloseStart() { }

}

export = View;