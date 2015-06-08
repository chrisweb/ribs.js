'use strict';

module Model {

    export var Model = (<any>Backbone.Model).extend({
        
        initialize: function(attributes, options) {
		
			var defaultOptions = {
				virtualAttributes: []
			};
		
			this.options = $.extend(defaultOptions, options || {});

            // on projection two way, get model of the action to avoid stackoverflow
			this.lastModelTriggered = null;
		
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
						
						var virtualAttributeKey = (<any>virtualAttribute).key;
						
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
         * @param twoWay If true, this model will be sync with its own attribute. So if a projection change one of these attributes, this model will be affected.
         **/
		getModelProjection: function getModelProjection(keepAlive, twoWay) {

		    var model = new Ribs.Model(this.attributes);

		    model.id = model.cid;//we do that to avoid same model with same id of the model (as long as Collection doesn't accept two model with same id)

		    this.listenTo(this, 'change', function () {

                // No trigger on the model of the action in two way
		        if (this.lastModelTriggered === model) {
		            return;
		        }

		        model.set(this.changed);

		    });

		    if (twoWay === true) {

		        this.listenTo(model, 'change', function () {

		            var newValue = {};

		            _.each(model.changed, (function(value, key) {

		                if (key in this.attributes) {

		                    newValue[key] = value;

		                }

		            }).bind(this))
                    
		            this.lastModelTriggered = model;

		            this.set(newValue);

		            this.lastModelTriggered = null;

		        });

		    }

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
        
        modelSource: null,
        lastModelTriggered: null

    });
    
}

export = Model.Model;