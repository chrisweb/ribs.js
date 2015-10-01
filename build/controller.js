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
    var Controller = (function () {
        function Controller(options, configuration, router) {
            this.options = options || {};
            this.router = router || new Backbone.Router();
            this.configuration = configuration || {};
            this.initialize(options, configuration, router);
            _.extend(this, Backbone.Events);
        }
        Object.defineProperty(Controller.prototype, "promise", {
            get: function () {
                return this._promise;
            },
            set: function (value) {
                this._promise = value;
            },
            enumerable: true,
            configurable: true
        });
        Controller.prototype.clear = function () { };
        Controller.prototype.initialize = function (options, configuration, router) {
            // execute it now
            this.onInitialize(this.options, configuration, this.router);
        };
        Controller.prototype.onInitialize = function (options, configuration, router) {
        };
        Controller.prototype.create = function (skeleton) {
            return null;
        };
        Controller.extend = function () {
            return Backbone.Model.extend.apply(this, arguments);
        };
        return Controller;
    })();
    return Controller;
});
//# sourceMappingURL=controller.js.map