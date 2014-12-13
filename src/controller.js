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
 * @returns {_L17.ribs.Controller|ribs.Controller}
 */
define([
    'underscore',
    'backbone'
    
], function (_, Backbone) {
    
    'use strict';
    
    var ribs = {};

    ribs.Controller = function ControllerFunction() {

        this.initialize.apply(this, arguments);

    };

    _.extend(ribs.Controller.prototype, Backbone.Events, {

        initialize: function controllerInitializeFunction(options, configuration, router) {

            this.options = options || {};
            this.router = router;

            // if oninitialize exists
            if (this.onInitialize) {

                // execute it now
                this.onInitialize(this.options, configuration, this.router);

            }

        }

    });
    
    ribs.Controller.extend = Backbone.Model.extend;
    
    return ribs.Controller;

});
