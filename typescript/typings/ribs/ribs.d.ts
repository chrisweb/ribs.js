// Type definitions for Ribs
// Project: https://github.com/chrisweb/ribs.js
// Definitions by: Norbert TRAN PHAT <https://github.com/MasGaNo>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

// Library documentation : https://github.com/chrisweb/ribs.js/blob/master/README.md

/// <reference path="../backbone/backbone.d.ts" />

declare module Ribs {

    class View extends Backbone.View<Backbone.Model> {
        protected onInitializeStart(): void;
        protected onInitialize(): void;
        protected onRenderStart(): void;
        protected onRender(): void;
        protected onCloseStart(): void;
        protected onClose(): void;
        protected onModelAdded(modelView: View): void;
        protected onModelRemoved(modelView: View): void;

        public isDispatch: boolean;
        protected template: Function;
    }

    class Model extends Backbone.Model {
        protected onInitializeStart(): void;
        protected onInitialize(): void;
        /**
         * Get a projection of the model. The model return will be sync with this current model.
         * @param keepAlive If true, when this model will be destroy, the projection will not be destroyed.
         **/
        public getModelProjection(keepAlive?: boolean = false): Model;

        /**
         * Original Model source
         */
        public modelSource: Ribs.Model;
    }

    class Collection extends Backbone.Collection<Backbone.Model> {
        onInitialize(options?: any): void;
        batchSave(): void;
        getFilteredCollection(onlyData?: any, notDatas?: any): void;
        collectionSource: Collection;
    }

    module ViewHelpers {
        function add(helperName: string, helperCallback: Function): void;
        function remove(helperName: string): void;
        function get(): { [s: string]: Function };
    }

}

declare module 'ribs' {
    export = Ribs;
}

declare module 'ribs.collection' {
    export class Collection { }
}

declare module 'ribs.model' {
    export class Model { }
}

declare module 'ribs.view' {
    function extend(extendData?:Object): any;
}

declare module 'ribs.viewHelper' {
    function add(helperName: string, helperCallback: Function): any;
    function remove(helperName: string): any;
    function get(): Object;
}

declare module 'ribs.container' {
    function dispatch(containerSelector: string, options?: Object): void;
    function add(containerSelector: string, view: any): void;
    function remove(containerSelector: string, view: any): void;
    function clear(containerSelector: string): void;
}
