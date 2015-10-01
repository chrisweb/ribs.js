'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './eventsManager', 'backbone', 'underscore'], factory);
    }
})(function (require, exports) {
    var EventsManager = require('./eventsManager');
    var Backbone = require('backbone');
    var _ = require('underscore');
    var Router = (function (_super) {
        __extends(Router, _super);
        function Router(options) {
            _super.call(this, options);
        }
        Router.prototype.initialize = function () {
        };
        Router.prototype.route = function (route, name, callback) {
            var _this = this;
            if (!_.isRegExp(route))
                route = this._routeToRegExp(route);
            if (_.isFunction(name)) {
                callback = name;
                name = '';
            }
            if (!callback)
                callback = this[name];
            Backbone.history.route(route, function (fragment) {
                var args = _this._extractParameters(route, fragment);
                // we use a callback function to allow async calls, the
                // original backbone code uses an if (see below)
                _this.execute(callback, args, name, function (executeRoute) {
                    if (executeRoute) {
                        _this.trigger.apply(_this, ['route:' + name].concat(args));
                        _this.trigger('route', name, args);
                        Backbone.history.trigger('route', _this, name, args);
                    }
                });
                /*
                if (router.execute(callback, args, name) !== false) {
                    
                    router.trigger.apply(router, ['route:' + name].concat(args));
                    router.trigger('route', name, args);
                    Backbone.history.trigger('route', router, name, args);
                    
                }
                */
            });
            return this;
        };
        Router.prototype.execute = function (callback, routeArguments, routeName, internalCallback) {
            // pre-route event
            EventsManager.trigger(EventsManager.constants.ROUTER_PREROUTE, { 'routeArguments': routeArguments, 'routeName': routeName });
            if (callback)
                callback.apply(this, routeArguments);
            // post route event
            EventsManager.trigger(EventsManager.constants.ROUTER_POSTROUTE, { 'routeArguments': routeArguments, 'routeName': routeName });
            if (internalCallback !== undefined) {
                // can return true or false, if false is returned the current
                // route will get aborted
                internalCallback(true);
            }
            else {
                // can return true or false, if false is returned the current
                // route will get aborted
                return true;
            }
        };
        Router.prototype.getCurrentRoute = function () {
            return Backbone.history.fragment;
        };
        return Router;
    })(Backbone.Router);
    return Router;
});
//# sourceMappingURL=router.js.map