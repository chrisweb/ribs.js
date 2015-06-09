/// <reference path="../scripts/typings/ribs/ribs.d.ts" />
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './collection', './container', './controller', './eventsManager', './model', './router', './view', './viewHelper'], function (require, exports) {
    var ModuleCollection = require('./collection');
    var ModuleContainer = require('./container');
    var ModuleController = require('./controller');
    var ModuleEventsManager = require('./eventsManager');
    var ModuleModel = require('./model');
    var ModuleRouter = require('./router');
    var ModuleView = require('./view');
    var ModuleViewHelper = require('./viewHelper');
    var Ribs;
    (function (Ribs) {
        Ribs.Collection = ModuleCollection;
        Ribs.Container = ModuleContainer;
        Ribs.Controller = ModuleController;
        Ribs.EventsManager = ModuleEventsManager;
        Ribs.Model = ModuleModel;
        Ribs.Router = ModuleRouter;
        Ribs.View = ModuleView;
        Ribs.ViewHelper = ModuleViewHelper;
    })(Ribs || (Ribs = {}));
    return Ribs;
});
//# sourceMappingURL=ribs.js.map