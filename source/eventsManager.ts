'use strict';

import Backbone = require('backbone');

class EventsManager extends Backbone.Events {

    constants = {

        // router
        'ROUTER_PREROUTE': 'router:preRoute',
        'ROUTER_POSTROUTE': 'router:postRoute'

    };

}

export = new EventsManager();