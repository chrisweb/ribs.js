'use strict';

import Backbone = require('backbone');
import $ = require('jquery');

export class Request {

    public options: {};

    public constructor(options: {} = {}) {
        
    }

    public setRequestHeader(headerName: string, headerValue: string): Request {
        return this;
    }

}

export class Adapter {

    options: {};

    public constructor(options: {} = {}) {
        this.options = options;
    }

    public load() {
        (<any>Backbone).ajax = this.getRequestInstance;
    }

    protected getRequestInstance(options: {} = {}): Request {

        return new Request(options);

    }

}

export class DefaultAdapter extends Adapter {
    protected getRequestInstance(options: {} = {}): Request {

        return (<any>$).ajax(options);

    }
}
