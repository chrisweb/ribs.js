/// <reference path="../scripts/typings/ribs/ribs.d.ts" />

import ModuleCollection = require('./collection');
import ModuleContainer = require('./container');
import ModuleController = require('./controller');
import ModuleEventsManager = require('./eventsManager');
import ModuleModel = require('./model');
import ModuleRouter = require('./router');
import ModuleView = require('./view');
import ModuleViewHelper = require('./viewHelper');

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