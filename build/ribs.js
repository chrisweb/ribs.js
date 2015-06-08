/// <reference path="../scripts/typings/ribs/ribs.d.ts" />
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'Collection', 'Container', 'Controller', 'EventsManager', 'Model', 'Router', 'View', 'ViewHelper'], function (require, exports) {
    var ModuleCollection = require('Collection');
    var ModuleContainer = require('Container');
    var ModuleController = require('Controller');
    var ModuleEventsManager = require('EventsManager');
    var ModuleModel = require('Model');
    var ModuleRouter = require('Router');
    var ModuleView = require('View');
    var ModuleViewHelper = require('ViewHelper');
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