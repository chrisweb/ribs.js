/**
 * https://github.com/chrisweb
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * router
 * 
 * @param {type} Backbone
 * @returns {_L16.Anonym$8}
 */
define([
    'backbone'
], function (Backbone) {
    
    'use strict';
    
    var ribs = {};
    
    ribs.Router = Backbone.Router.extend({

        initialize: function() {

        },
        routes: {},

        route: function(route, name, callback) {
            
            if (!_.isRegExp(route)) route = this._routeToRegExp(route);
            
            if (_.isFunction(name)) {
                
                callback = name;
                name = '';
                
            }
            
            if (!callback) callback = this[name];
            
            var router = this;
            
            Backbone.history.route(route, function(fragment) {
                
                var args = router._extractParameters(route, fragment);
                
                // we use a callback function to allow async calls, the
                // original backbone code uses an if
                router.execute(callback, args, name, function(executeRoute) {
                    
                    if (executeRoute) {
                    
                        router.trigger.apply(router, ['route:' + name].concat(args));
                        router.trigger('route', name, args);
                        Backbone.history.trigger('route', router, name, args);
                        
                    }
                    
                });
                
            });
            
            return this;
            
        },
        getCurrentRoute: function() {
            
            return Backbone.history.fragment;
            
        }

    });

    return ribs.Router;
    
});
