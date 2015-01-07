/**
 * https://github.com/chrisweb
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * events manager
 * 
 * @param {type} Backbone
 * @param {type} _
 * 
 * @returns {unresolved}
 */
define([
    'backbone',
    'underscore'
], function(Backbone, _) {
    
    'use strict';
    
    var eventsManager = {
        constants: {

            // router
            'ROUTER_PREROUTE': 'router:preRoute',
            'ROUTER_POSTROUTE': 'router:postRoute'
            
        }
    };
        
    var EventsManager = _.extend(eventsManager, Backbone.Events);

    return EventsManager;

});
