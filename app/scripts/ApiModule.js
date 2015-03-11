/* global define */
(function() {
    'use strict';
    define(['angular', 'services/cluster-svc', 'services/server-svc', 'services/request-svc', 'services/util-svc', 'services/user-svc'], function(angular, ClusterService, ServerService, RequestService, UtilService, UserService) {
        var moduleName = 'myAPIModule';
        // This module loads all the Calamari network API services.
        angular.module(moduleName, ['restangular'])
            .factory('ClusterService', ClusterService)
            .factory('ServerService', ServerService)
            .factory('RequestService', RequestService)
            .factory('UtilService', UtilService)
            .factory('UserService', UserService);
        return moduleName;
    });
})();
