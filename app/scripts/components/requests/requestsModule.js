/* global define */
(function() {
    'use strict';
    define(['angular', 'ApiModule', './controllers/requests', './services/request-tracking-svc', 'angular-growl'], function(angular, ApiModule, RequestsController, RequestTrackingService) {
        var moduleName = 'usmRequestManagerModule';
        angular.module(moduleName, ['angular-growl', ApiModule])
            .controller('RequestsController', RequestsController)
            .provider('RequestTrackingService', RequestTrackingService)
            .config(['growlProvider', function(growlProvider) {
                growlProvider.globalTimeToLive(10000);
                growlProvider.globalDisableCountDown(true);
            }]
        );
        return moduleName;
    });
})();