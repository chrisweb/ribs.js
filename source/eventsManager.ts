'use strict';

import Backbone = require('backbone');
import _ = require('underscore');

class EventsManager {

    constructor() { }

    constants = {

        // router
        'ROUTER_PREROUTE': 'router:preRoute',
        'ROUTER_POSTROUTE': 'router:postRoute'

    };

}

export = _.extend(new EventsManager(), Backbone.Events);