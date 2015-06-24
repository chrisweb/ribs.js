'use strict';

import Backbone = require('backbone');
import $ = require('jquery');

export class Request {

    public options: Ribs.Adapter.RequestAdapterOptions;

    public constructor(options: Ribs.Adapter.RequestAdapterOptions = { data: null }) {
        this.options = options;
    }

    public setRequestHeader(headerName: string, headerValue: string): Request {
        return this;
    }

}

export class Adapter {

    options: {};
    private requestBind;

    public constructor(options: {} = {}) {
        this.options = options;

        this.requestBind = this.getRequestInstance.bind(this);
    }

    public load() {
        (<any>Backbone).ajax = this.requestBind;
    }

    protected getRequestInstance(options: Ribs.Adapter.RequestAdapterOptions = { data: null }): Request {

        return new Request(options);

    }

}

export class DefaultAdapter extends Adapter {
    protected getRequestInstance(options: Ribs.Adapter.RequestAdapterOptions = { data: null }): Request {

        return (<any>$).ajax(options);

    }
}
