'use strict';
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    var EventsManager;
    (function (EventsManager_1) {
        var eventsManager = {
            constants: {
                // router
                'ROUTER_PREROUTE': 'router:preRoute',
                'ROUTER_POSTROUTE': 'router:postRoute'
            }
        };
        EventsManager_1.EventsManager = _.extend(eventsManager, Backbone.Events);
    })(EventsManager || (EventsManager = {}));
    return EventsManager.EventsManager;
});
//# sourceMappingURL=EventsManager.js.map