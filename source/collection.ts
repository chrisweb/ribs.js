'use strict';

export class Collection extends Backbone.Collection<Backbone.Model> {

    options: any;
    onInitialize;
    collectionSource: Collection = null;
    _isRange: boolean = false;
    _currentRange: number = 0;
    _lengthRange: number = 5;
    isCircularRange: boolean = false;
        
    initialize (models, options) {

        this.options = options || {};
            
        // if oninitialize exists
        if (this.onInitialize) {
                
            // execute it now
            this.onInitialize(options);
                
        }
            
    }

    batchSave () {
             
    }

    getFilteredCollection (onlyDatas, notDatas) {
        var filteredCollection = new Ribs.Collection();
            
        if (this.collectionSource === null) {
                
            filteredCollection.collectionSource = this;
                
        } else {
                
            filteredCollection.collectionSource = this.collectionSource; //Should be the root or the parent ?... that is the question.
                
        }
            
        filteredCollection.add(this.getFilteredModels(this.models, onlyDatas, notDatas));
            
        this.on('add', (models, collection, options) => {
                
            var newItems = this.getFilteredModels(models, onlyDatas, notDatas);
                
            filteredCollection.add(newItems, options);
                
        });
            
        this.on('remove', (models, collection, options) => {
                
            filteredCollection.remove(models, options);
                
        });
            
        this.on('reset', (collection, options) => {
                
            var newModels = this.getFilteredModels(collection.models, onlyDatas, notDatas);
                
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
    }

    getRange(start, length) {

        var rangeCollection = new Collection();

        if (this.collectionSource === null) {

            rangeCollection.collectionSource = this;

        } else {

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

    }

    setIsCircularRange (isCircularRange) {
        this.isCircularRange = true;
        return this;
    }

    rangeNext () {
            
        if (!this._isRange) {

            return this;

        }

        if (++this._currentRange >= this.collectionSource.length) {

            this._currentRange = 0;

        }

        this.nextRange.call(this);

        return this;
    }

    rangeNextPage () {

        if (!this._isRange) {

            return this;

        }

        if ((this._currentRange += this._lengthRange) >= this.collectionSource.length) {

            this._currentRange = 0;//Really a circular pagination???

        }

        this.nextRange.call(this);

        return this;

    }

    rangeGoTo (index, newLength) {

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

        this.nextRange.call(this);

        return this;

    }

    setRangeLength (length) {
            
        if (!this._isRange) {

            return this;

        }

        this._lengthRange = Math.max(length, 0);

        this.nextRange.call(this);

        return this;

    }

    private getFilteredModels(models, onlyDatas, notDatas): Backbone.Model[]{

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

        return _.filter<Backbone.Model>(onlyModels, function (model) {

            return notModels.indexOf(model) === -1;

        });
    }

    private getRangeOfCollection(collection, start, length) {

        if (collection.length < start) {

            return [];

        }

        return collection.models.slice(start, start + length);

    }

    private nextRange() {

        var models = this.getRangeOfCollection(this.collectionSource, this._currentRange, this._lengthRange);

        if (this._currentRange + this._lengthRange >= this.collectionSource.length) {

            models = models.concat(this.getRangeOfCollection(this.collectionSource, 0, this._lengthRange - (this.collectionSource.length - this._currentRange)));

        }

        this.reset(models);
    }
        
}