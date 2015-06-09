'use strict';

import EventsManager = require('EventsManager');
import Backbone = require('backbone');
import _ = require('underscore');

export class Router extends Backbone.Router {

    initialize () {

    }

    routes: {};

    route (route, name, callback) {

        if (!_.isRegExp(route)) route = (<any>this)._routeToRegExp(route);

        if (_.isFunction(name)) {

            callback = name;
            name = '';

        }

        if (!callback) callback = this[name];

        Backbone.history.route(route, (fragment) => {

            var args = (<any>this)._extractParameters(route, fragment);
                
            // we use a callback function to allow async calls, the
            // original backbone code uses an if (see below)
            this.execute(callback, args, name, function (executeRoute) {

                if (executeRoute) {

                    this.trigger.apply(this, ['route:' + name].concat(args));
                    this.trigger('route', name, args);
                    Backbone.history.trigger('route', this, name, args);

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

    }

    execute (callback, routeArguments, routeName, internalCallback) {
            
        // pre-route event
        EventsManager.trigger(EventsManager.constants.ROUTER_PREROUTE, { 'routeArguments': routeArguments, 'routeName': routeName });

        if (callback) callback.apply(this, routeArguments);
            
        // post route event
        EventsManager.trigger(EventsManager.constants.ROUTER_POSTROUTE, { 'routeArguments': routeArguments, 'routeName': routeName });

        if (internalCallback !== undefined) {
                
            // can return true or false, if false is returned the current
            // route will get aborted
            internalCallback(true);

        } else {
                
            // can return true or false, if false is returned the current
            // route will get aborted
            return true;

        }
    }

    getCurrentRoute () {

        return (<any>Backbone).history.fragment;

    }

}