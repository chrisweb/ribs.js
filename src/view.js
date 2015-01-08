/**
 * https://github.com/chrisweb
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * base view
 * 
 * @param {type} Backbone
 * @param {type} _
 * @param {type} $
 * @param {type} Container
 * 
 * @returns {unresolved}
 */
define([
    'backbone',
    'underscore',
    'jquery',
    'ribs.container'
    
], function(Backbone, _, $, Container) {

    'use strict';
	
    var defaultOptions = {
        removeModelOnClose: true, // Boolean: If true, remove model from its collection on view close.
        listSelector: 'list',
        variables: {},
        ModelView: null
    };
	
    var View = Backbone.View.extend({
        
        initialize: function(options) {

            this.options = $.extend(defaultOptions, options || {}) ;

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
            
            var renderedTemplate;
            
            if (this.model !== undefined) {

                renderedTemplate = this.template(this.getModelAsJson());
                
            } else if (_.keys(this.options.variables).length > 0) {

                renderedTemplate = this.template(this.options.variables);
                
            } else {
                
                renderedTemplate = this.template();
                
            }
            
            // sizzle of jquery will throw an error if the view content is
            // not encaplsulated in an html element, for example if the
            // content is just a text
            try {
                
                var $renderedTemplate = $(renderedTemplate);
                
            } catch(error) {
                
                throw 'The view template should have at least one root element and not more then one';
                
            }
            
            if ($renderedTemplate.length === 1) {

                var rootElement = $renderedTemplate.first().html('');

                this.setElement(rootElement);
                
            } else {
                
                // unfortunatly we have to ensure that the view template has
                // a root html element and that it only has one ... this is
                // because backbone views by design have an $el attribute
                // containing an element in which the template will be rendered
                throw 'The view template should have at least one root element and not more then one';
                
            }
            
            if (this.collection !== undefined) {
                
                this.listenTo(this.collection, 'add', this.addModel);
                this.listenTo(this.collection, 'remove', this.removeModel);
                this.listenTo(this.collection, 'reset', this.reset);
                
            }
            
            if (this.model !== undefined) {
                
                this.listenTo(this.model, 'destroy', this.close);
                
            }
            
            // if oninitialize exists
            if (this.onInitialize) {
                
                // execute it now
                this.onInitialize();
                
            }
            
        },
        render: function() {

            // if onRender exists
            if (this.onRenderStart) {
                
                // execute it now
                this.onRenderStart();
                
            }
            
            this.htmlize();

            // if onRender exists
            if (this.onRender) {
                
                // execute it now
                this.onRender();
                
            }

            return this;
            
        },
        htmlize: function() {

            var renderedTemplate;

             // is there a collection?
            if (this.collection !== undefined) {
            
                // and also a model or variables or nothing?
                if (this.model !== undefined) {
                    
                    renderedTemplate = this.template(this.getModelAsJson());
                    
                } else if (_.keys(this.options.variables).length > 0) {

                    renderedTemplate = this.template(this.options.variables);
                
                } else {
                    
                    renderedTemplate = this.template();
                    
                }

                // for each model of the collection append a modelView to
                // collection dom
                var that = this;
                
                if (this.collection.models.length > 0) {
                    
                    if (that.options.ModelView !== null) {
                
                        var ModelView = that.options.ModelView;
                        
                    } else {
                        
                        throw 'a collection view needs a ModelView passed on instantiation through the options';
                        
                    }
                    
                    var modelViewsAsHtml = [];

                    _.each(this.collection.models, function(model) {

                        var modelView = new ModelView({ model: model, parentView: that });
                        
                        that.collectionModelViews[model.cid] = modelView;
                        
                        var $html = modelView.create();

                        that.referenceModelView[model.cid] = {$html:$html};
                        
                        modelViewsAsHtml.push($html);

                    });

                    var $renderedTemplateCache = $(renderedTemplate);

                    if ($renderedTemplateCache.hasClass(this.options.listSelector)) {
                        
                        $renderedTemplateCache.append(modelViewsAsHtml);
                        
                    } else {
                    
                        $renderedTemplateCache.find('.' + this.options.listSelector).append(modelViewsAsHtml);
                        
                    }

                    // collection view
                    renderedTemplate = $renderedTemplateCache[0];
                    
                }

            } else if (this.model !== undefined) {

                // model view
                renderedTemplate = this.template(this.getModelAsJson());
                
            } else if (_.keys(this.options.variables).length > 0) {

                // variables view
                renderedTemplate = this.template(this.options.variables);
                
            } else {
                
                // basic view
                renderedTemplate = this.template();
                
            }

            this.setElement($(renderedTemplate));
            
        },
        getModelAsJson: function() {
            
            var data;
            
            if (this.model) {
                
                data = this.model.toJSON();
                
            } 
            
            return data;
            
        },
        getCollectionAsJson: function() {
            
            var data;
            
            if (this.collection) {
                
                data = this.collection.toJSON();
                
            } 
            
            return data;
            
        },
        close: function() {

            if (this.collectionModelViews !== null) {
                
                _.each(this.collectionModelViews, function closeModelViews(modelView) {

                    modelView.close();
                    
                });
                
                this.collectionModelViews = {};
                
            }

            // remove the view from dom and stop listening to events that were
            // added with listenTo or that were added to the events declaration
            this.remove();
            
            // unbind events triggered from within views using backbone events
            this.unbind();
            
            if (this.model !== null && this.options) {
                
                if (this.options.removeModelOnClose === true && !!this.model.collection === true) {
				
					this.model.collection.remove(this.model);
				
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

        },
        create: function() {

            return this.render().$el;

        },
        clear: function() {
            
            Container.clear(this.options.listSelector);
            
            this.referenceModelView = {};
            
        },
        empty: function() {
            
            //Container.clear(this.options.listId);
            
            if (this.collectionModelViews !== null) {
                
                _.each(this.collectionModelViews, function closeModelViews(modelView) {

                    modelView.close();
                    
                });
                
                this.collectionModelViews = {};
                
            }
            
            this.referenceModelView = {};
            
        },
        reset: function(collection) {
            
            this.empty();
            
            _.each(collection.models, (function(newModel) {
                
                this.addModel(newModel);
                
            }).bind(this));
                        
        },     
        addModel: function(model) {
            
            var ModelView = this.options.ModelView;

            var modelView = new ModelView({ model: model, parentView: this });

            var $element = modelView.create();

            this.referenceModelView[model.cid] = {$html:$element, container: modelView};

            var $container = this.$el.find('.list');
            
            if ($container.size() > 0) {
                
                $container.append($element);
                
            } else if (($container = this.$el.filter('.list')).size()) {
                
                $container.append($element);
                
            }
            
            Container.add(this.options.listSelector, modelView);
            
            this.collectionModelViews[model.cid] = modelView;
            
        },
        removeModel: function removeModelFunction(model) {
            
            var view = this.referenceModelView[model.cid];
            
            if (view === undefined) {
                return view;
            }
            
            if (view.container !== undefined) {
                
                Container.remove(this.options.listSelector, view.container);
                
                view.container.close();
                
                //TODO: close ?
                
            }
            
            if (view.$html !== undefined) {
                
                view.$html.remove();
                
            }
            
            delete this.referenceModelView[model.cid];
            
            delete this.collectionModelViews[model.cid];
            
            return view;
            
        }

    });

    return View;

});
