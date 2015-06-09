'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    var Controller = (function (_super) {
        __extends(Controller, _super);
        function Controller() {
            _super.call(this);
            this.initialize.apply(this, arguments);
        }
        Controller.prototype.initialize = function (options, configuration, router) {
            this.options = options || {};
            this.router = router;
            // if oninitialize exists
            if (this.onInitialize) {
                // execute it now
                this.onInitialize(this.options, configuration, this.router);
            }
        };
        Controller.extend = function () {
            return Backbone.Model.extend.apply(this, arguments);
        };
        return Controller;
    })(Backbone.Events);
    exports.Controller = Controller;
});
//# sourceMappingURL=Controller.js.map