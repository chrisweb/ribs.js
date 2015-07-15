'use strict';

import Backbone = require('backbone');
import $ = require('jquery');

export class Request {

    public options: Ribs.Adapter.RequestAdapterOptions;

    public constructor(options: Ribs.Adapter.RequestAdapterOptions = { data: null, type: 'GET' }) {
        this.options = this.formatOptions(options);
    }

    protected formatOptions(options: Ribs.Adapter.RequestAdapterOptions): Ribs.Adapter.RequestAdapterOptions {
        return options;
    }

    protected formatResponse(response: any): any {
        return response;
    }

    public setRequestHeader(headerName: string, headerValue: string): Request {
        return this;
    }

}

export class Adapter {

    options: {};
    private requestBind;

    public constructor(options: {} = {}) {
        this.options = this.formatOptions(options);

        this.requestBind = this.getRequestInstance.bind(this);
    }

    protected formatOptions(options: {}): {} {
        return options;
    }

    public load() {
        (<any>Backbone).ajax = this.requestBind;
    }

    protected getRequestInstance(options: Ribs.Adapter.RequestAdapterOptions = { data: null, type:'GET' }): Request {

        return new Request(options);

    }

}

export class DefaultAdapter extends Adapter {
    protected getRequestInstance(options: Ribs.Adapter.RequestAdapterOptions = { data: null, type: 'GET' }): Request {

        //return (<any>$).ajax(options);
        return new DefaultRequest(options);

    }
}

interface DefaultRequestResponse {
    position: number
    response: string|{}
};
interface DefaultRequestError {
    position: number
    errorThrown: string|Error|(string|Error)[]
};

export class DefaultRequest extends Request {

    private requestList: JQueryXHR[];

    public constructor(options: Ribs.Adapter.RequestAdapterOptions) {
        super(options);

        this.requestList = [];

        let errorList: DefaultRequestError[] = [];
        let responseList: DefaultRequestResponse[] = [];
        let successCallback: (response: string|{}) => any = null;
        let errorCallback: (xhr: Ribs.Adapter.Request, textStatus: string|string[], errorThrown: string|Error|(string|Error)[]) => any = null;

        // override success and error and call them after all request
        if (options.success) {

            successCallback = options.success;

            (<any>options).success = (response: string|{}, textStatus: string, jqXHR: JQueryXHR) => {

                responseList.push({ response: response, position: this.requestList.indexOf(jqXHR) });

                this.dispatchResult(errorList, responseList, successCallback, errorCallback);

            }

        }

        if (options.error) {

            let errorCallback: (xhr: Ribs.Adapter.Request, textStatus: string|string[], errorThrown: string|Error|(string|Error)[]) => any = options.error;
            options.error = (xhr: Ribs.Adapter.Request, textStatus: string|string[], errorThrown: string|Error|(string|Error)[]) => {

                errorList.push({ errorThrown: errorThrown, position: this.requestList.indexOf(<any>xhr) });

                this.dispatchResult(errorList, responseList, successCallback, errorCallback);

            }

        }


        if (options.data instanceof Array) {

            let requestOptions: Ribs.Adapter.RequestAdapterOptions = $.extend({}, options);

            (<{}[]>options.data).forEach((data) => {

                requestOptions.data = data;

                this.requestList.push($.ajax(<any>requestOptions));

            });

        } else {

            this.requestList.push($.ajax(<any>options));

        }
        

    }

    public setRequestHeader(headerName: string, headerValue: string): Request {
        this.requestList.forEach((jqXhr) => {

            jqXhr.setRequestHeader(headerName, headerValue);

        });

        return this;
    }

    private dispatchResult(errorList: DefaultRequestError[], responseList: DefaultRequestResponse[], successCallback: (response: string|{}) => any, errorCallback: (xhr: Ribs.Adapter.Request, textStatus: string|string[], errorThrown: string|Error|(string|Error)[]) => any) {

        if (errorList.length + responseList.length >= this.requestList.length) {

            if (errorList.length) {
                errorList.sort((a, b) => { return a.position - b.position; });
                errorCallback(<any>this, '', <any>errorList.map((value) => { return value.errorThrown }));
            } else {

                responseList.sort((a, b) => { return a.position - b.position });
                successCallback(responseList.map((value) => { return value.response }));


            }

        }

    }

}