'use strict';

import Backbone = require('backbone');
import $ = require('jquery');
import _ = require('underscore');

export class Request {

    public options: Ribs.Adapter.RequestAdapterOptions;

    public constructor(options: Ribs.Adapter.RequestAdapterOptions = { data: null, type: 'GET', url:'' }) {
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

    protected getRequestInstance(options: Ribs.Adapter.RequestAdapterOptions = { data: null, type: 'GET', url: '' }): Request {

        return new Request(options);

    }

}

export class DefaultAdapter extends Adapter {
    protected getRequestInstance(options: Ribs.Adapter.RequestAdapterOptions = { data: null, type: 'GET', url: '' }): Request {

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
    private originalData: {}|{}[];

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
                
                if ('responseJSON' in xhr) {
                    errorList.push({ errorThrown: (<any>xhr).responseJSON, position: this.requestList.indexOf(<any>xhr) });
                } else {
                    errorList.push({ errorThrown: errorThrown, position: this.requestList.indexOf(<any>xhr) });
                }

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

    protected formatOptions(options: Ribs.Adapter.RequestAdapterOptions): Ribs.Adapter.RequestAdapterOptions {

        options = super.formatOptions(options);

        // convert data for API Jamendo
        if (options.data instanceof Array) {

            this.originalData = options.data;

            let paramList = [];
            let uniqueKeyParam: { [attribute: string]: any[] } = {};

            (<{}[]>options.data).forEach((value: {}) => {

                let keys: string[] = Object.keys(value);

                if (keys.length > 1) {
                    // Multi-parameters have individual request because they can't be combined with others simple request
                    paramList.push(_.extend({}, value));
                } else {
                    // Group by single attribute 
                    let attribute = keys[0];
                    if (!(attribute in uniqueKeyParam)) {
                        uniqueKeyParam[attribute] = [];
                    }
                    let dataValue = value[attribute];

                    if (dataValue instanceof Array) {
                        uniqueKeyParam[attribute].splice.apply(uniqueKeyParam[attribute], [uniqueKeyParam[attribute].length, 0].concat(dataValue));
                    } else {
                        uniqueKeyParam[attribute].push(dataValue);
                    }
                }

            });

            for (let attribute in uniqueKeyParam) {

                let dataAttribute = {};
                dataAttribute[attribute] = _.uniq(uniqueKeyParam[attribute].sort(), true);
                paramList.push(dataAttribute);

            }

            options.data = paramList;

        } else {
            if (typeof options.data === 'string') {
                this.originalData = (<string>options.data).substr(0);
            } else {
                this.originalData = _.extend({}, options.data);
            }
        }

        return options;

    }

    private dispatchResult(errorList: DefaultRequestError[], responseList: DefaultRequestResponse[], successCallback: (response: string|{}) => any, errorCallback: (xhr: Ribs.Adapter.Request, textStatus: string|string[], errorThrown: string|Error|(string|Error)[]) => any) {

        if (errorList.length + responseList.length >= this.requestList.length) {

            if (errorList.length) {
                errorList.sort((a, b) => { return a.position - b.position; });
                errorCallback(<any>this, '', <any>errorList.map((value) => { return value.errorThrown }));
            } else {

                if (this.options.data instanceof Array) {
                    responseList.sort((a, b) => { return a.position - b.position });
                    successCallback(_.flatten(responseList.map((value) => { return value.response })));
                } else {
                    successCallback(responseList[0].response);
                }
            }

        }

    }

}