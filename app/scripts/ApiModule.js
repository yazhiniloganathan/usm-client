/* global define */
(function() {
    'use strict';
    define(['angular', 'services/cluster-svc', 'services/server-svc', 'services/request-svc', 'services/user-svc'], function(angular, ClusterService, ServerService, RequestService, UserService) {
        var moduleName = 'myAPIModule';
        // This module loads all the Calamari network API services.
        angular.module(moduleName, ['restangular'])
            .factory('ClusterService', ClusterService)
            .factory('ServerService', ServerService)
            .factory('RequestService', RequestService)
            .factory('UserService', UserService);
        return moduleName;
    });
})();
