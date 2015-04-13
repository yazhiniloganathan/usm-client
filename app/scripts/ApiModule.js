/* global define */
(function() {
    'use strict';
    define(['angular', 'services/cluster-svc', 'services/server-svc', 'services/volume-svc', 'services/request-svc', 'services/util-svc', 'services/user-svc'], function(angular, ClusterService, ServerService, VolumeService, RequestService, UtilService, UserService) {
        var moduleName = 'usmAPIModule';
        // This module loads all the USM network API services.
        angular.module(moduleName, ['restangular'])
            .factory('ClusterService', ClusterService)
            .factory('ServerService', ServerService)
            .factory('VolumeService', VolumeService)
            .factory('RequestService', RequestService)
            .factory('UtilService', UtilService)
            .factory('UserService', UserService);
        return moduleName;
    });
})();
