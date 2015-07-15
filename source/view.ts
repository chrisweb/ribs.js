'use strict';

import ViewHelper = require('./viewHelper');
import Container = require('./container');
import Backbone = require('backbone');
import $ = require('jquery');
import _ = require('underscore');
import ES6Promise = require('es6-promise');
import Promise = ES6Promise.Promise;

class View extends Backbone.View<Backbone.Model> {

    static defaultOptions: Ribs.ViewOptions = {
        removeModelOnClose: true, // Boolean: If true, remove model from its collection on view close
        reRenderOnChange: false,
        listSelector: '.list',
        templateVariables: {},
        ModelView: null,
        ModelViewOptions: {}
    };
    options: Ribs.ViewOptions;
    onInitialize;
    onInitializeStart;
    onRender;
    onRenderStart;
    onModelAdded;
    onModelRemoved;
    onClose;
    onCloseStart;
    collectionModelViews;
    referenceModelView;
    isDispatch: boolean = false;
    template;

    private pendingViewModel: JQuery[];
    private waitingForSort: boolean;
	
    constructor(options?) {
        super(options);
    }

    initialize (options) {

        this.pendingViewModel = [];
        this.waitingForSort = false;

        this.options = $.extend({}, View.defaultOptions, options || {});

        // if oninitialize exists
        if (this.onInitializeStart) {
                
            // execute it now
            this.onInitializeStart();

        }
            
        // collection children views, usefull when collection view gets
        // destroyed and we want to take some action on sub views
        this.collectionModelViews = {};
            
        // list of reference view by model. Usefull to delete all view
        // reference when a model is remove from the collection
        this.referenceModelView = {};
            
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
            
        // if oninitialize exists
        if (this.onInitialize) {
                
            // execute it now
            this.onInitialize();

        }

    }

    render () {

        // if onRender exists
        if (this.onRenderStart) {
                
            // execute it now
            this.onRenderStart();

        }

        let htmlizeObject = this.htmlize();

        let doRender = ($renderedTemplate: JQuery) => {

            this.setElement($renderedTemplate);

            // if onRender exists
            if (this.onRender) {
                
                // execute it now
                this.onRender();

            }

            this.isDispatch = true;

            return this;
        }

        if (htmlizeObject instanceof Promise) {

            return <any>htmlizeObject.then(doRender);

        }

        return doRender(<JQuery>htmlizeObject);

    }

    reRenderModelView() {

        let htmlizeObject = this.htmlize();

        let doRerender = ($renderedTemplate: JQuery) => {

            $(this.el).replaceWith($renderedTemplate);

            this.setElement($renderedTemplate);
        }

        if (htmlizeObject instanceof Promise) {
            htmlizeObject.then(doRerender);
        } else {
            doRerender(<JQuery>htmlizeObject);
        }

    }

    private htmlizeView(): JQuery|Promise<JQuery> {

        let templateKeyValues;

        let templateData = { _view: this };

        if (this.model !== undefined) {
            
            // model view
            // are there also templateVariables
            if (_.keys(this.options.templateVariables).length > 0) {

                templateKeyValues = $.extend(templateData, ViewHelper.get(), this.options.templateVariables, this.getModelAsJson());

            } else {

                templateKeyValues = $.extend(templateData, ViewHelper.get(), this.getModelAsJson());

            }


        } else if (_.keys(this.options.templateVariables).length > 0) {

            // templateVariables view
            templateKeyValues = $.extend(templateData, ViewHelper.get(), this.options.templateVariables);

        } else {
                
            // basic view
            templateKeyValues = $.extend(templateData, ViewHelper.get());

        }

        let templateResult = this.template(templateKeyValues);

        if (templateResult instanceof Promise) {
            return templateResult;
        }

        return $(templateResult);

    }

    htmlize(): JQuery|Promise<JQuery> {

        // is there a model or templateVariables or nothing?
        let viewHtml: JQuery|Promise<JQuery> = this.htmlizeView();

        let doCollection = ($renderedTemplate: JQuery): JQuery => {
            // and also a collection?
            if (this.collection !== undefined) {
            
                // for each model of the collection append a modelView to
                // collection dom

                if (this.collection.models.length > 0) {

                    let promiseList: Promise<JQuery>[] = [];

                    this.collection.models.forEach((model) => {

                        promiseList.push(this.addModel(model));

                    });

                    var $container = $renderedTemplate.find(this.options.listSelector);

                    if ($container.length === 0) {

                        if (($container = $renderedTemplate.filter(this.options.listSelector)).length === 0) {

                            $container = $();

                        }

                    }

                    Promise.all(promiseList).then(() => { this.updateCollection($container) });

                }

            }

            return $renderedTemplate;
        };

        if (viewHtml instanceof Promise) {
            return (<Promise<JQuery>>viewHtml).then(doCollection);
        }

        return doCollection(<JQuery>viewHtml);

    }

    getModelAsJson () {

        var data;

        if (this.model) {

            data = this.model.toJSON();

        }

        return data;

    }

    getCollectionAsJson () {

        var data;

        if (this.collection) {

            data = this.collection.toJSON();

        }

        return data;

    }

    close () {

        if (this.onCloseStart) {

            this.onCloseStart();

        }

        if (this.collectionModelViews !== null) {

            _.each(this.collectionModelViews, (function closeModelViews(modelView) {

                if (this.onModelRemoved) {

                    this.onModelRemoved(modelView);

                }

                modelView.close();

            }).bind(this));

            this.collectionModelViews = {};

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
            
        // if there is a onClose function ...
        if (this.onClose) {
                
            // execute it now
            this.onClose();

        }

    }

    create(): JQuery|Promise<JQuery> {

        if (this.isDispatch === true) {

            return this.$el;

        }

        let renderObject = this.render();

        if (renderObject instanceof Promise) {

            return (<Promise<View>>renderObject).then((view: View) => {
                return this.$el;
            });

        }

        return this.$el;

    }

    clear () {

        Ribs.Container.clear(this.options.listSelector);

        this.referenceModelView = {};

    }

    empty () {
            
        //Container.clear(this.options.listSelector);
            
        if (this.collectionModelViews !== null) {

            _.each(this.collectionModelViews, (function closeModelViews(modelView) {

                if (this.onModelRemoved) {

                    this.onModelRemoved(modelView);

                }

                modelView.close();

            }).bind(this));

            this.collectionModelViews = {};

        }

        this.referenceModelView = {};

    }

    reset (collection) {

        this.removeUnusedModelView(collection);

        _.each(collection.models, (function (newModel) {

            this.addModel(newModel);

        }).bind(this));

        this.updateCollection();

    }

    removeUnusedModelView (collection) {

        collection = collection || this.collection;

        _.each(this.collectionModelViews, (function (viewModel, cid) {

            if (!collection.get(cid)) {

                viewModel.close();

                delete this.collectionModelViews[cid];
                delete this.referenceModelView[cid];

            }

        }).bind(this));

    }

    private addModel(model): Promise<JQuery> {

        if (model.cid in this.collectionModelViews) {

            var $element = this.collectionModelViews[model.cid].$el;

            /*var $container = this.$el.find(this.options.listSelector);

            if ($container.length > 0) {

                $container.append($element);

            } else if (($container = this.$el.filter(this.options.listSelector)).length) {

                $container.append($element);

            }*/

            this.pendingViewModel.push($element);

            return;

        }

        if (this.options.ModelView === null) {

            throw 'a collection view needs a ModelView passed on instantiation through the options';

        }

        let ModelView = this.options.ModelView;

        var mergedModelViewOptions = $.extend({}, this.options.ModelViewOptions, { model: model, parentView: this });

        var modelView = new ModelView(mergedModelViewOptions);

        let doAddModel = ($element: JQuery): JQuery | Promise<JQuery> => {

            this.referenceModelView[model.cid] = {
                $html: $element,
                container: modelView
            };

            this.pendingViewModel.push($element);

            // TODO: use the container to manage subviews of a list
            //Container.add(this.options.listSelector, modelView);
            
            this.collectionModelViews[model.cid] = modelView;

            if (this.onModelAdded) {
                this.onModelAdded(modelView);
            }

            return $element;
        }

        let viewCreate = modelView.create();

        if (viewCreate instanceof Promise) {
            return viewCreate.then(doAddModel);
        }

        return Promise.resolve(doAddModel(viewCreate));

    }

    private removeModel (model) {

        var view = this.referenceModelView[model.cid];

        if (view === undefined) {
            return view;
        }

        if (view.container !== undefined) {
                
            // TODO: use the container to manage subviews of a list
            //Container.remove(this.options.listSelector, view.container);
                
            view.container.close();
                
            //TODO: close ?
                
        }

        if (view.$html !== undefined) {

            view.$html.remove();

        }

        delete this.referenceModelView[model.cid];

        delete this.collectionModelViews[model.cid];

        if (this.onModelRemoved) {

            this.onModelRemoved(view);

        }

        return view;

    }

    private sortModel($container: JQuery = null) {

        if (this.pendingViewModel.length) {
            this.waitingForSort = true;
            return;
        }

        if (!($container instanceof jQuery) || $container === null) {
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

            var modelView = this.collectionModelViews[model.cid];

            $container.append(modelView.$el);


        });

        $container.css('display', displayCss);

    }

    private updateCollection($container: JQuery = null) {

        if (!($container instanceof jQuery) || $container === null) {

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

}

export = View;