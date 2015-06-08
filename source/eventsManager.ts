'use strict';

module EventsManager {
    
    var eventsManager = {
        constants: {

            // router
            'ROUTER_PREROUTE': 'router:preRoute',
            'ROUTER_POSTROUTE': 'router:postRoute'
            
        }
    };
        
    export var EventsManager = _.extend(eventsManager, Backbone.Events);

}

export = EventsManager.EventsManager;
