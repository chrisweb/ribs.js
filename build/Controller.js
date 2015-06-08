'use strict';
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    var Controller;
    (function (Controller_1) {
        Controller_1.Controller = function ControllerFunction() {
            this.initialize.apply(this, arguments);
        };
        _.extend(Ribs.Controller.prototype, Backbone.Events, {
            initialize: function controllerInitializeFunction(options, configuration, router) {
                this.options = options || {};
                this.router = router;
                // if oninitialize exists
                if (this.onInitialize) {
                    // execute it now
                    this.onInitialize(this.options, configuration, this.router);
                }
            }
        });
        Controller_1.Controller.extend = Backbone.Model.extend;
    })(Controller || (Controller = {}));
    return Controller.Controller;
});
//# sourceMappingURL=Controller.js.map