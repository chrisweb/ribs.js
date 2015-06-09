'use strict';
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    var Container = (function () {
        function Container() {
            this.containers = {};
            this.bodyElement = $('body');
        }
        /**
         *
         * dispatch the views of all the container or by a container selector
         *
         * @param {type} containerSelector
         * @param {type} options
         *
         * @returns {undefined}
         */
        Container.prototype.dispatch = function (containerSelector, options) {
            if (containerSelector === undefined) {
                _.each(this.containers, function (views, containerSelector) {
                    this.dispatchViews.call(this, views, containerSelector, options);
                });
            }
            else {
                var views = this.containers[containerSelector];
                this.dispatchViews.call(this, views, containerSelector, options);
            }
        };
        /**
         *
         * add a view to a container
         *
         * @param {type} containerSelector
         * @param {type} view
         * @returns {undefined}
         */
        Container.prototype.add = function (containerSelector, view) {
            if (this.containers[containerSelector] === undefined) {
                this.containers[containerSelector] = [];
            }
            this.containers[containerSelector].push(view);
        };
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
        Container.prototype.remove = function (containerSelector, view) {
            if (this.containers[containerSelector] === undefined) {
                return;
            }
            var indexOf = this.containers[containerSelector].indexOf(view);
            if (indexOf > -1) {
                this.containers[containerSelector].splice(indexOf, 1);
            }
        };
        /**
         *
         * clear the view for a given selector
         * closes the view and also removes it from the container views list
         *
         * @param {type} containerSelector
         *
         * @returns {undefined}
         */
        Container.prototype.clear = function (containerSelector) {
            var views = this.containers[containerSelector];
            _.each(views, function (view) {
                view.close();
            });
            delete this.containers[containerSelector];
        };
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
        Container.prototype.dispatchViews = function (views, containerSelector, options) {
            var _this = this;
            _.each(views, function (view) {
                var viewHtml = view.create();
                if (options !== undefined
                    && _.has(options, 'insertMode')
                    && options.insertMode === 'prepend') {
                    _this.bodyElement.find(containerSelector).prepend(viewHtml);
                }
                else {
                    _this.bodyElement.find(containerSelector).append(viewHtml);
                }
            });
        };
        return Container;
    })();
    exports.Container = Container;
});
//# sourceMappingURL=Container.js.map