/**
 * https://github.com/chrisweb
 * 
 * Copyright 2014 weber chris
 * Released under the MIT license
 * https://chris.lu
 */

/**
 * 
 * base collection
 * 
 * @param {type} Backbone
 * @returns {unresolved}
 */
define([
    'backbone'
], function (Backbone) {
    
    'use strict';

    var Collection = Backbone.Collection.extend({
        
        initialize: function(models, options) {

            this.options = options || {};
            
            // if oninitialize exists
            if (this.onInitialize) {
                
                // execute it now
                this.onInitialize(options);
                
            }
            
        },
        batchSave: function() {
            
            
            
        }
        
    });

    return Collection;
    
});