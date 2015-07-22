'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'backbone', 'underscore', 'ribsjs'], function (require, exports) {
    var Backbone = require('backbone');
    var _ = require('underscore');
    var Ribs = require('ribsjs');
    var Collection = (function (_super) {
        __extends(Collection, _super);
        function Collection(models, options) {
            _super.call(this, models, options);
            this.collectionSource = null;
            this._isRange = false;
            this._currentRange = 0;
            this._lengthRange = 5;
            this.isCircularRange = false;
            if (this.options.adapter) {
                this.adapter = options.adapter;
            }
            else {
                this.adapter = new Ribs.Adapter.DefaultAdapter();
            }
        }
        Collection.prototype.initialize = function (models, options) {
            this.options = options || {};
            // if oninitialize exists
            if (this.onInitialize) {
                // execute it now
                this.onInitialize(options);
            }
        };
        Collection.prototype.batchSave = function () {
        };
        Collection.prototype.sync = function () {
            var arg = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                arg[_i - 0] = arguments[_i];
            }
            this.adapter.load();
            return _super.sync.apply(this, arg);
        };
        Collection.prototype.getFilteredCollection = function (onlyDatas, notDatas) {
            var _this = this;
            var filteredCollection = new Ribs.Collection();
            if (this.collectionSource === null) {
                filteredCollection.collectionSource = this;
            }
            else {
                filteredCollection.collectionSource = this.collectionSource; //Should be the root or the parent ?... that is the question.
            }
            filteredCollection.add(this.getFilteredModels(this.models, onlyDatas, notDatas));
            this.on('add', function (models, collection, options) {
                var newItems = _this.getFilteredModels(models, onlyDatas, notDatas);
                filteredCollection.add(newItems, options);
            });
            this.on('remove', function (models, collection, options) {
                filteredCollection.remove(models, options);
            });
            this.on('reset', function (collection, options) {
                var newModels = _this.getFilteredModels(collection.models, onlyDatas, notDatas);
                filteredCollection.reset.call(filteredCollection, newModels, options);
            });
            /*
            this.on('update', (collection, options) => {
    
                filteredCollection.trigger('update', filteredCollection, options);
    
            });*/
            /**
                * Now, I don't find the utility to listen sync event... Uncomment if you find it ;)
            var that = this;
            this.on('sync', function(model, responseServer, options) {
                
                var newItems = getFilteredModels(that.models, onlyDatas, notDatas);
                
                filteredCollection.add(model, options);
                
            });
                */
            return filteredCollection;
        };
        Collection.prototype.getRange = function (start, length) {
            var rangeCollection = new Collection();
            if (this.collectionSource === null) {
                rangeCollection.collectionSource = this;
            }
            else {
                rangeCollection.collectionSource = this.collectionSource; //Should be the root or the parent ?... that is the question.
            }
            rangeCollection._isRange = true;
            rangeCollection.isCircularRange = this.isCircularRange;
            rangeCollection._currentRange = start;
            rangeCollection._lengthRange = length;
            rangeCollection.set(this.getRangeOfCollection(this, start, length));
            this.on('add remove sync reset sort', (function () {
                rangeCollection.set(this.getRangeOfCollection(this, start, length));
            }).bind(this));
            return rangeCollection;
        };
        Collection.prototype.setIsCircularRange = function (isCircularRange) {
            this.isCircularRange = true;
            return this;
        };
        Collection.prototype.rangeNext = function () {
            if (!this._isRange) {
                return this;
            }
            if (++this._currentRange >= this.collectionSource.length) {
                this._currentRange = 0;
            }
            this.nextRange.call(this);
            return this;
        };
        Collection.prototype.rangeNextPage = function () {
            if (!this._isRange) {
                return this;
            }
            if ((this._currentRange += this._lengthRange) >= this.collectionSource.length) {
                this._currentRange = 0; //Really a circular pagination???
            }
            this.nextRange.call(this);
            return this;
        };
        Collection.prototype.rangeGoTo = function (index, newLength) {
            if (!this._isRange) {
                return this;
            }
            if (newLength !== undefined) {
                this._lengthRange = newLength;
            }
            if ((this._currentRange = index) >= this.collectionSource.length) {
                this._currentRange = 0;
            }
            else if (this._currentRange < 0) {
                if (this.isCircularRange) {
                    this._currentRange += this.collectionSource.length;
                }
                else {
                    this._currentRange = 0;
                }
            }
            this.nextRange.call(this);
            return this;
        };
        Collection.prototype.setRangeLength = function (length) {
            if (!this._isRange) {
                return this;
            }
            this._lengthRange = Math.max(length, 0);
            this.nextRange.call(this);
            return this;
        };
        Collection.prototype.getFilteredModels = function (models, onlyDatas, notDatas) {
            if (!(models instanceof Array)) {
                models = [models];
            }
            var onlyModels;
            var modelCollection = new Backbone.Collection(models);
            if (!!onlyDatas) {
                onlyModels = modelCollection.where(onlyDatas);
            }
            else {
                onlyModels = models;
            }
            var notModels;
            if (!!notDatas) {
                notModels = modelCollection.where(notDatas);
            }
            else {
                notModels = [];
            }
            return _.filter(onlyModels, function (model) {
                return notModels.indexOf(model) === -1;
            });
        };
        Collection.prototype.getRangeOfCollection = function (collection, start, length) {
            if (collection.length < start) {
                return [];
            }
            return collection.models.slice(start, start + length);
        };
        Collection.prototype.nextRange = function () {
            var models = this.getRangeOfCollection(this.collectionSource, this._currentRange, this._lengthRange);
            if (this._currentRange + this._lengthRange >= this.collectionSource.length) {
                models = models.concat(this.getRangeOfCollection(this.collectionSource, 0, this._lengthRange - (this.collectionSource.length - this._currentRange)));
            }
            this.reset(models);
        };
        return Collection;
    })(Backbone.Collection);
    return Collection;
});
//# sourceMappingURL=collection.js.map