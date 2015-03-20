/* global define */
(function() {
    'use strict';
    define(['angular', 'ApiModule', './services/request-tracking-svc'], function(angular, ApiModule, RequestTrackingService) {
        var moduleName = 'usmRequestManagerModule';
        angular.module(moduleName, [ApiModule])
            .provider('RequestTrackingService', RequestTrackingService);
        return moduleName;
    });
})();