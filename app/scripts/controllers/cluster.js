/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers'], function(_, ClusterHelpers) {

        var ClusterController = function($scope, $location, ClusterService) {
            ClusterService.getList().then(function(clusters){
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

            $scope.remove = function() {
                _.each($scope.clusters, function(cluster) {
                    if(cluster.selected) {
                        ClusterService.remove(cluster.cluster_id).then(function(result){
                            console.log(result);
                        });
                    }
                });
            };

            $scope.isDeleteAvailable = function() {
                return _.filter($scope.clusters, function(cluster){
                    return cluster.selected;
                }).length;
            }
        };
        return ['$scope', '$location', 'ClusterService', ClusterController];
    });
})();
