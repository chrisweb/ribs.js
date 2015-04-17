/**
 * https://github.com/chrisweb
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * view helper management
 * 
 * @returns {unresolved}
 */
define([
    'ribs'
], function(Ribs) {

    'use strict';
	
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
    
    return Ribs.ViewHelpers = {
        add:add,
        remove:remove,
        get:get
    };

});
