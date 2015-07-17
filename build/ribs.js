/// <reference path="../scripts/typings/ribs/ribsjs.d.ts" />
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './adapter', './collection', './container', './controller', './eventsManager', './model', './router', './view', './viewHelper'], function (require, exports) {
    exports.Adapter = require('./adapter');
    exports.Collection = require('./collection');
    exports.Container = require('./container');
    exports.Controller = require('./controller');
    exports.EventsManager = require('./eventsManager');
    exports.Model = require('./model');
    exports.Router = require('./router');
    exports.View = require('./view');
    exports.ViewHelper = require('./viewHelper');
});
//# sourceMappingURL=ribs.js.map