'use strict';
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'underscore', 'jquery', 'es6-promise'], function (require, exports) {
    var _ = require('underscore');
    var $ = require('jquery');
    var ES6Promise = require('es6-promise');
    var Promise = ES6Promise.Promise;
    var Container;
    (function (Container) {
        var containers = {};
        var bodyElement = $('body');
        /**
         *
         * dispatch the views of all the container or by a container selector
         *
         * @param {type} containerSelector
         * @param {type} options
         *
         * @returns Promise<void>
         */
        function dispatch(containerSelector, options) {
            if (containerSelector === undefined) {
                var promises = [];
                _.each(containers, function (views, containerSelector) {
                    var dispatchViewResult = dispatchViews(views, containerSelector, options);
                    if (dispatchViewResult instanceof Promise) {
                        promises.push(dispatchViewResult);
                    }
                });
                if (promises.length) {
                    return Promise.all(promises);
                }
            }
            else {
                var views = containers[containerSelector];
                return dispatchViews(views, containerSelector, options);
            }
        }
        Container.dispatch = dispatch;
        /**
         *
         * add a view to a container
         *
         * @param {type} containerSelector
         * @param {type} view
         * @returns {undefined}
         */
        function add(containerSelector, view) {
            if (containers[containerSelector] === undefined) {
                containers[containerSelector] = [];
            }
            containers[containerSelector].push(view);
        }
        Container.add = add;
        /**
         *
         * remove a view from the list, for a given selector
         * just remove the view from the list, don't close it
         *
         * @param {type} containerSelector
         * @param {type} view
         *
         * @returns {undefined}
         */
        function remove(containerSelector, view) {
            if (containers[containerSelector] === undefined) {
                return;
            }
            var indexOf = containers[containerSelector].indexOf(view);
            if (indexOf > -1) {
                containers[containerSelector].splice(indexOf, 1);
            }
        }
        Container.remove = remove;
        /**
         *
         * clear the view for a given selector
         * closes the view and also removes it from the container views list
         *
         * @param {type} containerSelector
         *
         * @returns {undefined}
         */
        function clear(containerSelector) {
            var views = containers[containerSelector];
            _.each(views, function (view) {
                view.close();
            });
            delete containers[containerSelector];
        }
        Container.clear = clear;
        /**
         *
         * (private) dispatch the views
         *
         * @param {type} views
         * @param {type} containerSelector
         * @param {type} options
         *
         * @returns {undefined}
         */
        function dispatchViews(views, containerSelector, options) {
            var promises = [];
            var $container = bodyElement.find(containerSelector);
            if ($container.length === 0) {
                $container = bodyElement.filter(containerSelector);
                if ($container.length === 0) {
                    $container = $();
                }
            }
            _.each(views, function (view) {
                var doAppend = function (viewHtml) {
                    if (options !== undefined
                        && _.has(options, 'insertMode')
                        && options.insertMode === 'prepend') {
                        $container.prepend(viewHtml);
                    }
                    else {
                        $container.append(viewHtml);
                    }
                };
                var viewCreate = view.create();
                if (viewCreate instanceof Promise) {
                    promises.push(viewCreate.then(doAppend));
                }
                else {
                    doAppend(viewCreate);
                }
            });
            if (promises.length) {
                return Promise.all(promises);
            }
        }
    })(Container || (Container = {}));
    return Container;
});
//# sourceMappingURL=container.js.map