'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'backbone', 'jquery', 'underscore'], function (require, exports) {
    var Backbone = require('backbone');
    var $ = require('jquery');
    var _ = require('underscore');
    var Request = (function () {
        function Request(options) {
            if (options === void 0) { options = { data: null, type: 'GET', url: '' }; }
            this.options = this.formatOptions(options);
        }
        Request.prototype.formatOptions = function (options) {
            return options;
        };
        Request.prototype.formatResponse = function (response) {
            return response;
        };
        Request.prototype.setRequestHeader = function (headerName, headerValue) {
            return this;
        };
        return Request;
    })();
    exports.Request = Request;
    var Adapter = (function () {
        function Adapter(options) {
            if (options === void 0) { options = {}; }
            this.options = this.formatOptions(options);
            this.requestBind = this.getRequestInstance.bind(this);
        }
        Adapter.prototype.formatOptions = function (options) {
            return options;
        };
        Adapter.prototype.load = function () {
            Backbone.ajax = this.requestBind;
        };
        Adapter.prototype.getRequestInstance = function (options) {
            if (options === void 0) { options = { data: null, type: 'GET', url: '' }; }
            return new Request(options);
        };
        return Adapter;
    })();
    exports.Adapter = Adapter;
    var DefaultAdapter = (function (_super) {
        __extends(DefaultAdapter, _super);
        function DefaultAdapter() {
            _super.apply(this, arguments);
        }
        DefaultAdapter.prototype.getRequestInstance = function (options) {
            if (options === void 0) { options = { data: null, type: 'GET', url: '' }; }
            //return (<any>$).ajax(options);
            return new DefaultRequest(options);
        };
        return DefaultAdapter;
    })(Adapter);
    exports.DefaultAdapter = DefaultAdapter;
    ;
    ;
    var DefaultRequest = (function (_super) {
        __extends(DefaultRequest, _super);
        function DefaultRequest(options) {
            var _this = this;
            _super.call(this, options);
            this.requestList = [];
            var errorList = [];
            var responseList = [];
            var successCallback = null;
            var errorCallback = null;
            // override success and error and call them after all request
            if (options.success) {
                successCallback = options.success;
                options.success = function (response, textStatus, jqXHR) {
                    responseList.push({ response: response, position: _this.requestList.indexOf(jqXHR) });
                    _this.dispatchResult(errorList, responseList, successCallback, errorCallback);
                };
            }
            if (options.error) {
                var errorCallback_1 = options.error;
                options.error = function (xhr, textStatus, errorThrown) {
                    errorList.push({ errorThrown: errorThrown, position: _this.requestList.indexOf(xhr) });
                    _this.dispatchResult(errorList, responseList, successCallback, errorCallback_1);
                };
            }
            if (options.data instanceof Array) {
                var requestOptions = $.extend({}, options);
                options.data.forEach(function (data) {
                    requestOptions.data = data;
                    _this.requestList.push($.ajax(requestOptions));
                });
            }
            else {
                this.requestList.push($.ajax(options));
            }
        }
        DefaultRequest.prototype.setRequestHeader = function (headerName, headerValue) {
            this.requestList.forEach(function (jqXhr) {
                jqXhr.setRequestHeader(headerName, headerValue);
            });
            return this;
        };
        DefaultRequest.prototype.formatOptions = function (options) {
            options = _super.prototype.formatOptions.call(this, options);
            // convert data for API Jamendo
            if (options.data instanceof Array) {
                this.originalData = options.data;
                var paramList = [];
                var uniqueKeyParam = {};
                options.data.forEach(function (value) {
                    var keys = Object.keys(value);
                    if (keys.length > 1) {
                        // Multi-parameters have individual request because they can't be combined with others simple request
                        paramList.push(_.extend({}, value));
                    }
                    else {
                        // Group by single attribute 
                        var attribute = keys[0];
                        if (!(attribute in uniqueKeyParam)) {
                            uniqueKeyParam[attribute] = [];
                        }
                        var dataValue = value[attribute];
                        if (dataValue instanceof Array) {
                            uniqueKeyParam[attribute].splice.apply(uniqueKeyParam[attribute], [uniqueKeyParam[attribute].length, 0].concat(dataValue));
                        }
                        else {
                            uniqueKeyParam[attribute].push(dataValue);
                        }
                    }
                });
                for (var attribute in uniqueKeyParam) {
                    var dataAttribute = {};
                    dataAttribute[attribute] = _.uniq(uniqueKeyParam[attribute].sort(), true);
                    paramList.push(dataAttribute);
                }
                options.data = paramList;
            }
            else {
                if (typeof options.data === 'string') {
                    this.originalData = options.data.substr(0);
                }
                else {
                    this.originalData = _.extend({}, options.data);
                }
            }
            return options;
        };
        DefaultRequest.prototype.dispatchResult = function (errorList, responseList, successCallback, errorCallback) {
            if (errorList.length + responseList.length >= this.requestList.length) {
                if (errorList.length) {
                    errorList.sort(function (a, b) { return a.position - b.position; });
                    errorCallback(this, '', errorList.map(function (value) { return value.errorThrown; }));
                }
                else {
                    if (this.options.data instanceof Array) {
                        responseList.sort(function (a, b) { return a.position - b.position; });
                        successCallback(_.flatten(responseList.map(function (value) { return value.response; })));
                    }
                    else {
                        successCallback(responseList[0].response);
                    }
                }
            }
        };
        return DefaultRequest;
    })(Request);
    exports.DefaultRequest = DefaultRequest;
});
//# sourceMappingURL=adapter.js.map