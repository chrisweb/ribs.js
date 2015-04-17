/**
 * https://github.com/chrisweb
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * base model
 * 
 * @param {type} Backbone
 * @param {type} _
 *
 * @returns {unresolved}
 */
define([
    'backbone',
	'underscore',
    'ribs'
], function (Backbone, _, Ribs) {
    
    'use strict';

    Ribs.Model = Backbone.Model.extend({
        
        initialize: function(attributes, options) {
		
			var defaultOptions = {
				virtualAttributes: []
			};
		
			this.options = $.extend(defaultOptions, options || {}) ;
		
			// if onInitializeStart exists
            if (this.onInitializeStart) {
                
                // execute it now
                this.onInitializeStart();
                
            }
            
            // if onInitialize exists
            if (this.onInitialize) {
                
                // execute it now
                this.onInitialize();
                
            }
            
        },
		get: function (attribute) {
			
			if (typeof this[attribute] === 'function') {
			
				return this[attribute]();
				
			} else {
			
				return Backbone.Model.prototype.get.call(this, attribute);
				
			}
			
		},
		toJSON: function() {
			
			var attributes = Backbone.Model.prototype.toJSON.call(this);
			
			if (_.has(this.options, 'virtualAttributes')) {
			
				var that = this;
				
				_.each(this.options.virtualAttributes, function(virtualAttribute) {
				
					if (_.has(virtualAttribute, 'key')) {
						
						var virtualAttributeKey = virtualAttribute.key;
						
						if (_.isFunction(that[virtualAttributeKey])) {
						
							attributes[virtualAttributeKey] = that[virtualAttributeKey].call(that);
							
						} else {
						
							throw 'virtual attribute function missing';
						
						}
						
					} else {
						
						throw 'virtual attribute "key" missing';
						
					}
				
				});
				
			}
			
			return attributes;
			
		},
        /**
         * Get a projection of the model. The model return will be sync with this current model.
         * @param keepAlive If true, when this model will be destroy, the projection will not be destroyed.
         **/
		getModelProjection: function getModelProjection(keepAlive) {

		    var model = new Ribs.Model(this.attributes);

		    this.listenTo(this, 'change', function () {

		        model.set(this.changed);

		    });

		    if (keepAlive !== true) {

		        this.listenTo(this, 'destroy', function () {

		            model.destroy();

		        });

		    }

		    if (this.modelSource === null) {

		        model.modelSource = this;

		    } else {

		        model.modelSource = this.modelSource;

		    }

		    return model;

		},
        
        modelSource: null


    });

    return Ribs.Model;
    
});