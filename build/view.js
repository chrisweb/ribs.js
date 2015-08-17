'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './viewHelper', 'backbone', 'jquery', 'underscore', 'es6-promise'], function (require, exports) {
    var ViewHelper = require('./viewHelper');
    var Backbone = require('backbone');
    var $ = require('jquery');
    var _ = require('underscore');
    var ES6Promise = require('es6-promise');
    var Promise = ES6Promise.Promise;
    var View = (function (_super) {
        __extends(View, _super);
        function View(options) {
            _super.call(this, options);
            this.isDispatch = false;
        }
        View.prototype.initialize = function (options) {
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
            // if oninitialize exists
            if (this.onInitialize) {
                // execute it now
                this.onInitialize();
            }
        };
        View.prototype.render = function () {
            var _this = this;
            // if onRender exists
            if (this.onRenderStart) {
                // execute it now
                this.onRenderStart();
            }
            var htmlizeObject = this.htmlize();
            var doRender = function ($renderedTemplate) {
                _this.setElement($renderedTemplate);
                // if onRender exists
                if (_this.onRender) {
                    // execute it now
                    _this.onRender();
                }
                _this.isDispatch = true;
                return _this;
            };
            if (htmlizeObject instanceof Promise) {
                return htmlizeObject.then(doRender);
            }
            return doRender(htmlizeObject);
        };
        View.prototype.reRenderModelView = function () {
            var _this = this;
            var htmlizeObject = this.htmlize();
            var doRerender = function ($renderedTemplate) {
                $(_this.el).replaceWith($renderedTemplate);
                _this.setElement($renderedTemplate);
            };
            if (htmlizeObject instanceof Promise) {
                htmlizeObject.then(doRerender);
            }
            else {
                doRerender(htmlizeObject);
            }
        };
        View.prototype.htmlizeView = function () {
            var templateKeyValues;
            var templateData = { _view: this };
            if (this.model !== undefined) {
                // model view
                // are there also templateVariables
                if (_.keys(this.options.templateVariables).length > 0) {
                    templateKeyValues = $.extend(templateData, ViewHelper.get(), this.options.templateVariables, this.getModelAsJson());
                }
                else {
                    templateKeyValues = $.extend(templateData, ViewHelper.get(), this.getModelAsJson());
                }
            }
            else if (_.keys(this.options.templateVariables).length > 0) {
                // templateVariables view
                templateKeyValues = $.extend(templateData, ViewHelper.get(), this.options.templateVariables);
            }
            else {
                // basic view
                templateKeyValues = $.extend(templateData, ViewHelper.get());
            }
            var templateResult = this.template(templateKeyValues);
            if (templateResult instanceof Promise) {
                return templateResult;
            }
            return $(templateResult);
        };
        View.prototype.htmlize = function () {
            var _this = this;
            // is there a model or templateVariables or nothing?
            var viewHtml = this.htmlizeView();
            var doCollection = function ($renderedTemplate) {
                // and also a collection?
                if (_this.collection !== undefined) {
                    // for each model of the collection append a modelView to
                    // collection dom
                    if (_this.collection.models.length > 0) {
                        var promiseList = [];
                        _this.collection.models.forEach(function (model) {
                            promiseList.push(_this.addModel(model));
                        });
                        var $container = $renderedTemplate.find(_this.options.listSelector);
                        if ($container.length === 0) {
                            if (($container = $renderedTemplate.filter(_this.options.listSelector)).length === 0) {
                                $container = $();
                            }
                        }
                        return Promise.all(promiseList).then(function () {
                            _this.updateCollection($container);
                            return $renderedTemplate;
                        });
                    }
                }
                return $renderedTemplate;
            };
            var doSubView = function ($renderedTemplate) {
                var promiseList = [];
                _.each(_this.referenceModelView, function (modelViewList, selector) {
                    if (selector === _this.options.listSelector) {
                        return;
                    }
                    _.each(modelViewList, function (modelView) {
                        promiseList.push(modelView.create());
                    });
                });
                if (promiseList.length) {
                    return Promise.all(promiseList).then(function () {
                        _.each(_this.referenceModelView, function (modelViewList, selector) {
                            if (selector !== _this.options.listSelector) {
                                _this._addView(selector, Object.keys(modelViewList).map(function (cid) { return modelViewList[cid]; }), $renderedTemplate);
                            }
                        });
                        return $renderedTemplate;
                    });
                }
                return $renderedTemplate;
            };
            if (viewHtml instanceof Promise) {
                return viewHtml.then(doCollection).then(doSubView);
            }
            var doCollectionView = doCollection(viewHtml);
            if (doCollectionView instanceof Promise) {
                return doCollectionView.then(doSubView);
            }
            return doSubView(doCollectionView);
        };
        View.prototype.getModelAsJson = function () {
            var data;
            if (this.model) {
                data = this.model.toJSON();
            }
            return data;
        };
        View.prototype.getCollectionAsJson = function () {
            var data;
            if (this.collection) {
                data = this.collection.toJSON();
            }
            return data;
        };
        View.prototype.close = function () {
            var _this = this;
            if (this.onCloseStart) {
                this.onCloseStart();
            }
            if (this.referenceModelView !== null) {
                _.each(this.referenceModelView, function (modelViewCollection, selector) {
                    _.each(modelViewCollection, function (modelView) {
                        if (_this.onModelRemoved) {
                            _this.onModelRemoved(modelView);
                        }
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
                if (this.options.removeModelOnClose === true && !!this.collection === true) {
                    this.collection.remove(this.model);
                }
            }
            if (this.collection !== null) {
            }
            // if there is a onClose function ...
            if (this.onClose) {
                // execute it now
                this.onClose();
            }
        };
        View.prototype.create = function () {
            var _this = this;
            if (this.isDispatch === true) {
                return this.$el;
            }
            var renderObject = this.render();
            if (renderObject instanceof Promise) {
                return renderObject.then(function (view) {
                    return _this.$el;
                });
            }
            return this.$el;
        };
        View.prototype.clear = function () {
            Ribs.Container.clear(this.options.listSelector);
        };
        View.prototype.empty = function () {
            //Container.clear(this.options.listSelector);
            var _this = this;
            if (this.referenceModelView !== null) {
                _.each(this.referenceModelView, function (modelViewList, selector) {
                    _.each(modelViewList, function (modelView) {
                        if (_this.onModelRemoved) {
                            _this.onModelRemoved(modelView);
                        }
                        modelView.close();
                    });
                });
                this.referenceModelView = {};
                if ('listSelector' in this.options) {
                    this.referenceModelView[this.options.listSelector] = {};
                }
            }
        };
        View.prototype.reset = function (collection) {
            this.removeUnusedModelView(collection);
            _.each(collection.models, (function (newModel) {
                this.addModel(newModel);
            }).bind(this));
            this.updateCollection();
        };
        View.prototype.removeUnusedModelView = function (collection) {
            collection = collection || this.collection;
            var collectionModelView = this.referenceModelView[this.options.listSelector];
            if (!collectionModelView) {
                return;
            }
            _.each(collectionModelView, function (viewModel, cid) {
                if (!collection.get(cid)) {
                    viewModel.close();
                    delete collectionModelView[cid];
                }
            });
        };
        View.prototype.addModel = function (model) {
            var _this = this;
            if (model.cid in this.referenceModelView[this.options.listSelector]) {
                var $element = this.referenceModelView[this.options.listSelector][model.cid].$el;
                this.pendingViewModel.push($element);
                return;
            }
            if (this.options.ModelView === null) {
                throw 'a collection view needs a ModelView passed on instantiation through the options';
            }
            var ModelView = this.options.ModelView;
            var mergedModelViewOptions = $.extend({}, this.options.ModelViewOptions, { model: model, parentView: this });
            var modelView = new ModelView(mergedModelViewOptions);
            var doAddModel = function ($element) {
                _this.pendingViewModel.push($element);
                // TODO: use the container to manage subviews of a list
                //Container.add(this.options.listSelector, modelView);
                _this.referenceModelView[_this.options.listSelector][model.cid] = modelView;
                if (_this.onModelAdded) {
                    _this.onModelAdded(modelView);
                }
                return $element;
            };
            var viewCreate = modelView.create();
            if (viewCreate instanceof Promise) {
                return viewCreate.then(doAddModel);
            }
            return Promise.resolve(doAddModel(viewCreate));
        };
        View.prototype.removeModel = function (model) {
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
            if (this.onModelRemoved) {
                this.onModelRemoved(view);
            }
            return view;
        };
        View.prototype.sortModel = function ($container) {
            var _this = this;
            if ($container === void 0) { $container = null; }
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
            var displayCss = $container.css('display');
            $container.css('display', 'none');
            _.each(this.collection.models, function (model) {
                var modelView = _this.referenceModelView[_this.options.listSelector][model.cid];
                $container.append(modelView.$el);
            });
            $container.css('display', displayCss);
        };
        View.prototype.updateCollection = function ($container) {
            if ($container === void 0) { $container = null; }
            if ($container === null) {
                $container = this.$el.find(this.options.listSelector);
                if ($container.length === 0) {
                    if (($container = this.$el.filter(this.options.listSelector)).length === 0) {
                        $container = $();
                    }
                }
            }
            // avoid lot of reflow and repaint.
            var displayCss = $container.css('display');
            $container.css('display', 'none');
            $container.append(this.pendingViewModel);
            this.pendingViewModel.splice(0, this.pendingViewModel.length);
            if (this.waitingForSort) {
                this.sortModel($container);
                this.waitingForSort = false;
            }
            $container.css('display', displayCss);
        };
        View.prototype.addView = function (selector, view) {
            var _this = this;
            var displayMode = this.$el.css('display'); // Use css because some time show/hide use not expected display value
            this.$el.css('display', 'none'); // Don't display to avoid reflow
            if (typeof selector !== 'string') {
                _.each(selector, function (viewList, selectorPath) {
                    _this._addView(selectorPath, viewList);
                });
                return;
            }
            else {
                this._addView(selector, view);
            }
            this.$el.css('display', displayMode);
            return this;
        };
        View.prototype._addView = function (selector, view, $el) {
            var _this = this;
            if ($el === void 0) { $el = this.$el; }
            if (!(selector in this.referenceModelView)) {
                this.referenceModelView[selector] = {};
            }
            var doAddView = function (viewToAdd) {
                _this.referenceModelView[selector][viewToAdd.cid] = viewToAdd;
                if (_this.isDispatch !== true && $el === _this.$el) {
                    return;
                }
                var $container = $el.find(selector);
                if ($container.length === 0) {
                    if (($container = $el.filter(selector)).length === 0) {
                        $container = $();
                    }
                }
                $container.append(viewToAdd.$el);
                // Try to find another way to optimize reflow here... Pass addModel to Promise system?
                if (viewToAdd.isDispatch !== false) {
                    var $oldEl = viewToAdd.$el;
                    var newCreateView = viewToAdd.create();
                    if (newCreateView instanceof Promise) {
                        newCreateView.then(function ($renderNewCreate) {
                            $oldEl.replaceWith($renderNewCreate);
                        });
                    }
                    else {
                        $oldEl.replaceWith(newCreateView);
                    }
                }
            };
            if (view instanceof Array) {
                return view.forEach(doAddView);
            }
            doAddView(view);
        };
        View.defaultOptions = {
            removeModelOnClose: true,
            reRenderOnChange: false,
            listSelector: '.list',
            templateVariables: {},
            ModelView: null,
            ModelViewOptions: {}
        };
        return View;
    })(Backbone.View);
    return View;
});
//# sourceMappingURL=view.js.map