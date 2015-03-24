/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {
        var RequestsController = function(RequestTrackingService) {
        };
        return ['RequestTrackingService', RequestsController];
    });
})();