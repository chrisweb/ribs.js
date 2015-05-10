/**
 * https://github.com/chrisweb
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * ribs views container (singleton)
 * 
 * @param {type} Backbone
 * @param {type} _
 * @param {type} $
 * @param {type} Ribs
 * 
 * @returns {_L17.Anonym$2}
 * 
 */
define([
    'backbone',
    'underscore',
    'jquery',
    'ribs'
    
], function(Backbone, _, $, Ribs) {

    'use strict';

    var instance = null;

    /**
     * 
     * container constructor
     * 
     * @returns {container_L22.ContainerSingleton}
     */
    var ContainerSingleton = function ContainerSingletonFunction() {
        
        if (instance !== null) {
            throw new Error('singleton has already been instantiated, use getInstance()');
        }
        
        this.containers = {};
        
        this.bodyElement = $('body');
        
    };
    
    ContainerSingleton.prototype = {
        
        /**
         * 
         * dispatch the views of all the container or by a container selector
         * 
         * @param {type} containerSelector
         * @param {type} options
         * 
         * @returns {undefined}
         */
        dispatch: function dispatchFunction(containerSelector, options) {
            
            if (containerSelector === undefined) {

                _.each(this.containers, function(views, containerSelector) {

                    dispatchViews.call(this, views, containerSelector, options);

                });

            } else {

                var views = this.containers[containerSelector];

                dispatchViews.call(this, views, containerSelector, options);

            }

        },

        /**
         * 
         * add a view to a container
         * 
         * @param {type} containerSelector
         * @param {type} view
         * @returns {undefined}
         */
        add: function addFunction(containerSelector, view) {

            if (this.containers[containerSelector] === undefined) {

                this.containers[containerSelector] = [];

            }

            this.containers[containerSelector].push(view);

        },
        
        /**
         * 
         * remove a view from the list, for a given selector
         * just remove the view from the list, don't close it
         * 
         * @param {type} containerSelector
         * @param {type} view
         * 
         * @returns {undefined}
         */
        remove: function removeFunction(containerSelector, view) {

            if (this.containers[containerSelector] === undefined) {

                return;

            }
            
            var indexOf = this.containers[containerSelector].indexOf(view);
            
            if (indexOf > -1) {
                
                this.containers[containerSelector].splice(indexOf, 1);
                
            }

        },

        /**
         * 
         * clear the view for a given selector
         * closes the view and also removes it from the container views list
         * 
         * @param {type} containerSelector
         * 
         * @returns {undefined}
         */
        clear: function clearFunction(containerSelector) {

            var views = this.containers[containerSelector];

            _.each(views, function(view) {

                view.close();

            });

            delete this.containers[containerSelector];

        }
        
    };
    
    /**
     * 
     * (private) dispatch the views
     * 
     * @param {type} views
     * @param {type} containerSelector
     * @param {type} options
     * 
     * @returns {undefined}
     */
    var dispatchViews = function(views, containerSelector, options) {
        
        var that = this;
        
        _.each(views, function(view) {

            var viewHtml = view.create();

            if (options !== undefined
                && _.has(options, 'insertMode')
                && options.insertMode === 'prepend') {

                that.bodyElement.find(containerSelector).prepend(viewHtml);

            } else {

                that.bodyElement.find(containerSelector).append(viewHtml);

            }

        });
        
    };
    
    /**
     * 
     * get a container instance
     * 
     * @returns {container_L22.ContainerSingleton}
     */
    var getInstance = function () {
        
        if (instance === null) {

            instance = new ContainerSingleton();
            
        }
        
        return instance;
        
    };

    return Ribs.Container = getInstance();

});
