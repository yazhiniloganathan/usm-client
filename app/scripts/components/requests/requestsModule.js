/* global define */
(function() {
    'use strict';
    define(['angular', 'ApiModule', './controllers/requests', './services/request-tracking-svc'], function(angular, ApiModule, RequestsController, RequestTrackingService) {
        var moduleName = 'usmRequestManagerModule';
        angular.module(moduleName, [ApiModule])
            .controller('RequestsController', RequestsController)
            .provider('RequestTrackingService', RequestTrackingService);
        return moduleName;
    });
})();