'use strict';
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'backbone', 'underscore'], factory);
    }
})(function (require, exports) {
    var Backbone = require('backbone');
    var _ = require('underscore');
    var EventsManager = (function () {
        function EventsManager() {
            this.constants = {
                // router
                'ROUTER_PREROUTE': 'router:preRoute',
                'ROUTER_POSTROUTE': 'router:postRoute'
            };
        }
        return EventsManager;
    })();
    return _.extend(new EventsManager(), Backbone.Events);
});
//# sourceMappingURL=eventsManager.js.map