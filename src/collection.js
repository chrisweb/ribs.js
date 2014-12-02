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
    'backbone',
    'underscore'
], function (Backbone, _) {
    
    'use strict';
    
    function getFilteredModels(models, onlyDatas, notDatas) {
        
        if (!(models instanceof Array)) {
            
            models = [models];
            
        }
        
        var onlyModels;
        var modelCollection = new Backbone.Collection(models);
        
        if (!!onlyDatas) {
            
            onlyModels = modelCollection.where(onlyDatas);
            
        } else {
            
            onlyModels = models;
            
        }
        
        var notModels;
        if (!!notDatas) {
            
            notModels = modelCollection.where(notDatas);
            
        } else {
            
            notModels = [];
            
        }
        
        return _.filter(onlyModels, function(model) {
            
            return notModels.indexOf(model) === -1;
            
        });
    }
    
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
            
            
            
        },
        getFilteredCollection: function(onlyDatas, notDatas) {
            var filteredCollection = new Collection();
            
            if (this.collectionSource === null) {
                
                filteredCollection.collectionSource = this;
                
            } else {
                
                filteredCollection.collectionSource = this.collectionSource; //Should be the root or the parent ?... that is the question.
                
            }
            
            filteredCollection.add(getFilteredModels(this.models, onlyDatas, notDatas));
            
            this.on('add', function(models, collection, options) {
                
                var newItems = getFilteredModels(models, onlyDatas, notDatas);
                
                filteredCollection.add(newItems, options);
                
            });
            
            this.on('remove', function(models, collection, options) {
                
                filteredCollection.remove(models, options);
                
            });
            
            this.on('reset', function(collection, options) {
                
                var newModels = getFilteredModels(collection.models, onlyDatas, notDatas);
                
                filteredCollection.reset.call(filteredCollection, newModels, options);
                
            });
            
            /**
             * Now, I don't find the utility to listen sync event... Uncomment if you find it ;)
            var that = this;
            this.on('sync', function(model, responseServer, options) {
            
                var newItems = getFilteredModels(that.models, onlyDatas, notDatas);
            
                filteredCollection.add(model, options);
            
            });
             */
            
            return filteredCollection;
        },
        collectionSource: null
        
    });

    return Collection;
    
});