'use strict';

import Backbone = require('backbone');

export class Controller extends Backbone.Events {

    options: any;
    router: Backbone.Router;
    onInitialize;
    
    constructor () {
        
        super();
        this.initialize.apply(this, arguments);
        
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

    static extend() {
        return (<any>Backbone.Model).extend.apply(this, arguments);
    }
    
}