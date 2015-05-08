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
 * @param {type} _
 * 
 * @returns {unresolved}
 */
define([
    'backbone',
    'underscore',
    'ribs'
], function (Backbone, _, Ribs) {
    
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

    function getRangeOfCollection(collection, start, length) {

        if (collection.length < start) {

            return [];

        }
        
        return collection.models.slice(start, start + length);

    }

    function nextRange() {
        
        var models = getRangeOfCollection(this.collectionSource, this._currentRange, this._lengthRange);

        if (this._currentRange + this._lengthRange >= this.collectionSource.length) {

            models = models.concat(getRangeOfCollection(this.collectionSource, 0, this._lengthRange - (this.collectionSource.length - this._currentRange)));

        }

        this.reset(models);
    }
    
    Ribs.Collection = Backbone.Collection.extend({
        
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
            var filteredCollection = new Ribs.Collection();
            
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

        getRange: function(start, length) {

            var rangeCollection = new Ribs.Collection();

            if (this.collectionSource === null) {

                rangeCollection.collectionSource = this;

            } else {

                rangeCollection.collectionSource = this.collectionSource; //Should be the root or the parent ?... that is the question.

            }

            rangeCollection._isRange = true;
            rangeCollection.isCircularRange = this.isCircularRange;
            rangeCollection._currentRange = start;
            rangeCollection._lengthRange = length;
            rangeCollection.set(getRangeOfCollection(this, start, length));

            this.on('add remove sync reset sort', (function () {
                rangeCollection.set(getRangeOfCollection(this, start, length));
            }).bind(this));

            return rangeCollection;

        },

        setIsCircularRange: function setIsCircularRangeFunction(isCircularRange) {
            this.isCircularRange = true;
            return this;
        },

        rangeNext: function rangeNextFunction() {
            
            if (!this._isRange) {

                return this;

            }

            if (++this._currentRange >= this.collectionSource.length) {

                this._currentRange = 0;

            }

            nextRange.call(this);

            return this;
        },

        rangeNextPage: function rangeNextPageFunction() {

            if (!this._isRange) {

                return this;

            }

            if ((this._currentRange += this._lengthRange) >= this.collectionSource.length) {

                this._currentRange = 0;//Really a circular pagination???

            }

            nextRange.call(this);

            return this;

        },

        rangeGoTo: function rangeGoToFunction(index, newLength) {

            if (!this._isRange) {

                return this;

            }

            if (newLength !== undefined) {

                this._lengthRange = newLength;

            }

            if ((this._currentRange = index) >= this.collectionSource.length) {

                this._currentRange = 0;

            } else if (this._currentRange < 0) {
                if (this.isCircularRange) {
                    this._currentRange += this.collectionSource.length;
                } else {
                    this._currentRange = 0;
                }
            }

            nextRange.call(this);

            return this;

        },

        setRangeLength: function setRangeLengthFunction(length) {
            
            if (!this._isRange) {

                return this;

            }

            this._lengthRange = Math.max(length, 0);

            nextRange.call(this);

            return this;

        },

        collectionSource: null,
        _isRange: false,
        _currentRange: 0,
        _lengthRange: 5,
        isCircularRange: false
        
    });

    return Ribs.Collection;
    
});