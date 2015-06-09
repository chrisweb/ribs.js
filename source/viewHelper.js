'use strict';
var ViewHelper;
(function (ViewHelper) {
    var viewHelpers = {};
    function add(helperName, helperCallback) {
        viewHelpers[helperName] = helperCallback;
    }
    ViewHelper.add = add;
    function remove(helperName) {
        delete viewHelpers[helperName];
    }
    ViewHelper.remove = remove;
    ;
    function get() {
        return viewHelpers;
    }
    ViewHelper.get = get;
    ;
})(ViewHelper || (ViewHelper = {}));
module.exports = ViewHelper;
//# sourceMappingURL=ViewHelper.js.map