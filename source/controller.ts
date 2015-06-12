'use strict';

import Backbone = require('backbone');
import _ = require('underscore');

class Controller {

    options: any;
    router: Backbone.Router;
    onInitialize;
    create;
    private createPromise;

    constructor(options, configuration, router) {

        this.initialize(options, configuration, router);
        _.extend(this, Backbone.Events);

    }

    initialize (options, configuration, router) {

        this.options = options || {};
        this.router = router;

        // if oninitialize exists
        if (this.onInitialize) {

            // execute it now
            this.onInitialize(this.options, configuration, this.router);

        }

    }

    clear() {
        (<any>this).off();
        this.createPromise = null;
    }

    static extend() {
        return (<any>Backbone.Model).extend.apply(this, arguments);
    }

}

export = Controller;