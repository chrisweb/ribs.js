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
})(["require", "exports", 'backbone', 'jquery'], function (require, exports) {
    var Backbone = require('backbone');
    var $ = require('jquery');
    var Request = (function () {
        function Request(options) {
            if (options === void 0) { options = { data: null }; }
            this.options = options;
        }
        Request.prototype.setRequestHeader = function (headerName, headerValue) {
            return this;
        };
        return Request;
    })();
    exports.Request = Request;
    var Adapter = (function () {
        function Adapter(options) {
            if (options === void 0) { options = {}; }
            this.options = options;
        }
        Adapter.prototype.load = function () {
            Backbone.ajax = this.getRequestInstance;
        };
        Adapter.prototype.getRequestInstance = function (options) {
            if (options === void 0) { options = { data: null }; }
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
            if (options === void 0) { options = { data: null }; }
            return $.ajax(options);
        };
        return DefaultAdapter;
    })(Adapter);
    exports.DefaultAdapter = DefaultAdapter;
});
//# sourceMappingURL=adapter.js.map