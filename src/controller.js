/**
 * https://github.com/ribs
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * ribs controller
 * 
 * @param {type} _
 * @param {type} Backbone
 * @param {type} container
 * @returns {_L17.ribs.Controller|ribs.Controller}
 */
define([
    'underscore',
    'backbone',
    'ribs.container'
], function (_, Backbone, container) {
    
    'use strict';
    
    var ribs = {};

    ribs.Controller = function ControllerFunction() {

        this.initialize.apply(this, arguments);

    };

    _.extend(ribs.Controller.prototype, Backbone.Events, {

        initialize: function controllerInitializeFunction(options, configuration, router) {

            this.options = options || {};
            this.configuration = configuration.get();
            this.router = router;

            // if oninitialize exists
            if (this.onInitialize) {

                // execute it now
                this.onInitialize(this.options, this.configuration, this.router);

            }

        },
        dispatch: function controllerDispatchFunction(containerId) {

            container.dispatch(containerId);

        }

    });
    
    ribs.Controller.extend = Backbone.Model.extend;
    
    return ribs.Controller;

});