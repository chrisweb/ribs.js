'use strict';

module Controller {
    
    export var Controller = function ControllerFunction() {
        
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
    
    (<any>Controller).extend = (<any>Backbone.Model).extend;
    
}

export = Controller.Controller;
