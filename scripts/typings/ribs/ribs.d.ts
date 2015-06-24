// Type definitions for Ribs
// Project: https://github.com/chrisweb/ribs.js
// Definitions by: Norbert TRAN PHAT <https://github.com/MasGaNo>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

// Library documentation : https://github.com/chrisweb/ribs.js/blob/master/README.md

/// <reference path="../backbone/backbone.d.ts" />
/// <reference path="../es6-promise/es6-promise.d.ts" />

declare module Ribs {

    interface ViewOptions extends Backbone.ViewOptions<Backbone.Model> {
        /** 
         * If true, remove model from its collection on view close
         **/
        removeModelOnClose?: boolean;
        reRenderOnChange?: boolean;
        listSelector?: string;
        templateVariables?: Object;
        ModelView?: View|any;//hack...
        ModelViewOptions?: ViewOptions;
    }

    interface ViewReference {
        $html: JQuery;
        container: Backbone.View<Backbone.Model>;
    }

    interface CollectionOptions extends Backbone.CollectionFetchOptions {
        adapter?: Ribs.Adapter.Adapter
    }

    interface ModelOptions extends Backbone.ModelFetchOptions {
        adapter?: Ribs.Adapter.Adapter
    }

    interface ContainerOptions {
        insertMode?: string
    }

    class View extends Backbone.View<Backbone.Model> {

        public constructor(options?: ViewOptions);
        protected onInitializeStart(): void;
        protected onInitialize(): void;
        public create(): JQuery|Promise<JQuery>;
        protected onRenderStart(): void;
        protected onRender(): void;
        protected reRenderModelView(): void;
        public htmlize(): JQuery|Promise<JQuery>;
        protected getModelAsJson(): JSON;
        protected getCollectionAsJson(): JSON;
        public clear(): void;
        public empty(): void;
        protected reset(): void;
        public close(): void;
        protected onCloseStart(): void;
        protected onClose(): void;
        protected addModel(model: Backbone.Model): void;
        protected removeModel(model: Backbone.Model): void;
        protected onModelAdded(modelView: View): void;
        protected onModelRemoved(modelView: View): void;

        public isDispatch: boolean;
        //protected template: Function;
        protected referenceModelView: { [cid: string]: ViewReference };
    }

    class Model extends Backbone.Model {
        constructor(attributes, options?: ModelOptions);
        protected onInitializeStart(): void;
        protected onInitialize(): void;
        /**
            * Get a projection of the model. The model return will be sync with this current model.
            * @param modelClass Class of model projection.
            * @param keepAlive If true, when this model will be destroy, the projection will not be destroyed.
            * @param twoWay If true, this model will be sync with its own attribute. So if a projection change one of these attributes, this model will be affected.
            **/
        public getModelProjection(modelClass?: typeof Model, keepAlive?: boolean, twoWay?: boolean): Model;

        /**
         * Original Model source
         */
        public modelSource: Ribs.Model;

        public adapter: Ribs.Adapter.Adapter;
    }

    class Collection extends Backbone.Collection<Backbone.Model> {
        constructor(models?, options?: CollectionOptions);
        onInitialize(options?: any): void;
        batchSave(): void;
        getFilteredCollection(onlyData?: any, notDatas?: any): Collection;
        getRange(start: number, length: number): Collection;
        rangeNextPage(): Collection;
        rangeNext(): Collection;
        rangeGoTo(index: number, newLength?: number): Collection;
        setRangeLength(length: number): Collection;

        _isRange: boolean;
        isCircularRange: boolean;
        _currentRange: number;
        _lengthRange: number;

        public adapter: Ribs.Adapter.Adapter;
        collectionSource: Collection;
    }

    class Controller {
        public constructor(options: any, configuration: any, router: any);
        extend(): void;
        initialize(): void;
        create;
        clear(): void;
        off;
        promise;
    }

    module Container {
        function dispatch(containerSelector?: string, options?: Ribs.ContainerOptions): Promise<any>|void;
        function add(containerSelector: string, view: any): void;
        function remove(containerSelector: string, view: any): void;
        function clear(containerSelector: string): void;
    }

    class CEventsManager extends Backbone.Events {
        
        public constants: { [index: string]: string};

    }
    
    var EventsManager: CEventsManager;

    class Router extends Backbone.Router {
        constructor(options?: Backbone.RouterOptions);
        public execute(callback, routeArguments, routeName, internalCallback): void;
        public getCurrentRoute: string;
    }

    function ViewsLoader(views: string, callback: Function);

    module ViewHelper {
        function add(helperName: string, helperCallback: Function): void;
        function remove(helperName: string): void;
        function get(): { [s: string]: Function };
    }
    
    module Adapter {

        interface RequestAdapterOptions {
            data: {};
            type: string;
            success?: (response: string|{}) => any;
            error?: (xhr: Adapter.Request, textStatus: string|string[], errorThrown: string|Error|(string|Error)[]) => any;
        }

        /**
         * Class of Adapter to allow sync method to connect to different kind of connection.
         **/
        class Adapter {

            public options: {};

            public constructor(options?: {});

            /**
             * Apply the Adapter method. Call it before sync call.
             **/
            public load();
            /**
             * Return the instance of the request adapter
             * @param Options of the request adapter
             * @return The Request adapter instance
             **/
            protected getRequestInstance(options?: RequestAdapterOptions): Request;
        }

        /**
         * Class of Request Adapter. It will perform the connection.
         **/
        class Request {
            /**
             * Options of the request.
             **/
            public options: {};
            public constructor(options?: {});
            /**
             * Add new header request.
             * @param headerName Name of the header.
             * @param headerValue Value of the header. Expect a string, so JSON/Object should be serialized
             * @return Current instance Request to allow chaining operation.
             **/
            public setRequestHeader(headerName: string, headerValue: string): Request;
        }

        /**
         * Default Adapter. Based on Backbone implementation.
         **/
        class DefaultAdapter extends Adapter {
            /**
             * Return the default Backbone implementation.
             * @param options Options for Backbone request.
             * @return Default Request Adapter: JQueryXHR.
             **/
            protected getRequestInstance(options?: RequestAdapterOptions): Request;
        }

    }

}

declare module 'ribsjs' {
    export = Ribs;
}
