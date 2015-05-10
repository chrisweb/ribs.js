/**
 * https://github.com/chrisweb
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * ribs events manager
 * 
 * @param {type} Backbone
 * @param {type} _
 * @param {type} Ribs
 * 
 * @returns {unresolved}
 * 
 */
define([
    'backbone',
    'underscore',
    'ribs'
    
], function(Backbone, _, Ribs) {
    
    'use strict';
    
    var eventsManager = {
        constants: {

            // router
            'ROUTER_PREROUTE': 'router:preRoute',
            'ROUTER_POSTROUTE': 'router:postRoute'
            
        }
    };
        
    Ribs.EventsManager = _.extend(eventsManager, Backbone.Events);

    return Ribs.EventsManager;

});
