'use strict';

module viewHelper {
	
    var viewHelpers = {};
    
    function add(helperName, helperCallback) {
        
        viewHelpers[helperName] = helperCallback;
        
    }
    
    function remove(helperName) {
        
        delete viewHelpers[helperName];
        
    }
    
    function get() {
        
        return viewHelpers;
        
    }
    
    export var ViewHelpers = {
        add:add,
        remove:remove,
        get:get
    };

}

export = viewHelper.ViewHelpers;
