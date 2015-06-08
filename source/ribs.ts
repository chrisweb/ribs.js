/// <reference path="../scripts/typings/ribs/ribs.d.ts" />

import ModuleCollection = require('Collection');
import ModuleContainer = require('Container');
import ModuleController = require('Controller');
import ModuleEventsManager = require('EventsManager');
import ModuleModel = require('Model');
import ModuleRouter = require('Router');
import ModuleView = require('View');
import ModuleViewHelper = require('ViewHelper');

module Ribs {
    export var Collection = ModuleCollection;
    export var Container = ModuleContainer;
    export var Controller = ModuleController;
    export var EventsManager = ModuleEventsManager;
    export var Model = ModuleModel;
    export var Router = ModuleRouter;
    export var View = ModuleView;
    export var ViewHelper = ModuleViewHelper;
}

export = Ribs;