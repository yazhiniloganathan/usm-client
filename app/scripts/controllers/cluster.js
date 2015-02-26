/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers'], function(_, ClusterHelpers) {

        var ClusterController = function($scope, $location, ClusterService) {
            ClusterService.getList().then(function(clusters){
                console.log(clusters);
                $scope.clusters = clusters;
            });

            $scope.getClusterTypeTitle = function(type) {
                return ClusterHelpers.getClusterType(type).type;
            };

            $scope.getStorageTypeTitle = function(type) {
                return ClusterHelpers.getStorageType(type).type;
            };

            $scope.getStatusTitle = function(type) {
                return ClusterHelpers.getClusterStatus(type).state;
            };

            $scope.create = function() {
                $location.path('/clusters/new');
            };
        };
        return ['$scope', '$location', 'ClusterService', ClusterController];
    });
})();
