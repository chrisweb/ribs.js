'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'backbone', 'underscore', 'ribsjs'], factory);
    }
})(function (require, exports) {
    var Backbone = require('backbone');
    var _ = require('underscore');
    var RibsDefinition = require('ribsjs');
    var Ribs;
    (function (Ribs) {
        var Collection = (function (_super) {
            __extends(Collection, _super);
            function Collection(models, options) {
                _super.call(this, models, options);
                this.collectionSource = null;
                this._isRange = false;
                this._currentRange = 0;
                this._lengthRange = 5;
                this.isCircularRange = false;
                this.isClose = false;
                if (this.options.adapter) {
                    this.adapter = options.adapter;
                }
                else {
                    this.adapter = new RibsDefinition.Adapter.DefaultAdapter();
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
                return _super.prototype.sync.apply(this, arg);
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
                var selfAddCallback = function (models, collection, options) {
                    var newItems = _this.getFilteredModels(models, onlyDatas, notDatas);
                    filteredCollection.add(newItems, options);
                };
                this.listenTo(this, 'add', selfAddCallback);
                var selfRemoveCallback = function (models, collection, options) {
                    filteredCollection.remove(models, options);
                };
                this.listenTo(this, 'remove', selfRemoveCallback);
                var selfResetCallback = function (collection, options) {
                    var newModels = _this.getFilteredModels(collection.models, onlyDatas, notDatas);
                    filteredCollection.reset.call(filteredCollection, newModels, options);
                };
                this.listenTo(this, 'reset', selfResetCallback);
                filteredCollection.listenTo(filteredCollection, 'close:collection', function () {
                    _this.stopListening(_this, 'add', selfAddCallback);
                    _this.stopListening(_this, 'remove', selfRemoveCallback);
                    _this.stopListening(_this, 'reset', selfResetCallback);
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
                var _this = this;
                var rangeCollection = new Collection([], this.options);
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
                var selfCallback = _.debounce((function () {
                    rangeCollection.set(this.getRangeOfCollection(this, start, length));
                }).bind(this), 16); // debounce to avoid sort and update trigger on added model.
                this.listenTo(this, 'update sync reset sort', selfCallback);
                rangeCollection.listenTo(rangeCollection, 'close:collection', function () {
                    _this.stopListening(_this, 'update sync reset sort', selfCallback);
                });
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
            Collection.prototype.close = function () {
                var _this = this;
                this.isClose = true;
                this.trigger('close:collection', this);
                this.trigger('close', this);
                if (this.models) {
                    this.models.forEach(function (model) {
                        if ('close' in model && model.collection === _this) {
                            model.close();
                        }
                    });
                }
            };
            Object.defineProperty(Collection.prototype, "length", {
                get: function () {
                    return this.models ? this.models.length : 0;
                },
                enumerable: true,
                configurable: true
            });
            return Collection;
        })(Backbone.Collection);
        Ribs.Collection = Collection;
    })(Ribs || (Ribs = {}));
    return Ribs.Collection;
});
//# sourceMappingURL=collection.js.map