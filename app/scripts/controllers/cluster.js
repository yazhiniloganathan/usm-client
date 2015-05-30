/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers', 'helpers/mock-data-provider-helpers', 'c3'], function(_, ClusterHelpers, MockDataProviderHelpers, c3) {
        window.c3 = c3;
        var ClusterController = function($scope, $location, $interval, ClusterService, ServerService, VolumeService, PoolService) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });

            $scope.clusters = [];

            getAllClusters();

            function getAllClusters() {
                $scope.clusters = [];
                ClusterService.getList().then(function(clusters){
                    _.each(clusters, function(cluster) {
                        var mockCluster = MockDataProviderHelpers.getMockCluster(cluster.cluster_name);
                        var tempCluster = {
                            cluster_id : cluster.cluster_id,
                            cluster_name : cluster.cluster_name,
                            cluster_type : cluster.cluster_type,
                            storage_type : cluster.storage_type,
                            cluster_status : cluster.cluster_status,
                            no_of_hosts : 0,
                            no_of_volumes_or_pools : 0,
                            description : mockCluster.description,
                            data_used : mockCluster.data_used,
                            alerts : mockCluster.alerts,
                            areaSpline_cols : [{ id:1, name: 'Used', color: '#39a5dc', type: 'area-spline' }],
                            areaSpline_values : mockCluster.areaSpline_values,
                            gauge_cols : [ { id:1, name: 'Used', color: $scope.getClusterGaugeColor(mockCluster.gauge_values[0]['1']), type: 'gauge' }],
                            gauge_values : mockCluster.gauge_values
                        };
                        ServerService.getListByCluster(cluster.cluster_id).then(function (hosts) {
                             tempCluster.no_of_hosts = hosts.length;
                             if($scope.getClusterTypeTitle(cluster.cluster_type) === 'Gluster') {
                                VolumeService.getListByCluster(cluster.cluster_id).then(function (volumes) {
                                     tempCluster.no_of_volumes_or_pools = volumes.length;
                                     $scope.clusters.push(tempCluster);
                                });
                             }else {
                                PoolService.getListByCluster(cluster.cluster_id).then(function (pools) {
                                     tempCluster.no_of_volumes_or_pools = pools.length;
                                     $scope.clusters.push(tempCluster);
                                });
                             }
                        });
                    });
                });
            }

            $scope.getClusterGaugeColor = function(gauge_value) {
                return (0<=gauge_value && gauge_value<=75) ? 'green' : ((76<=gauge_value && gauge_value<=85) ? 'orange' : 'red')
            };

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

            $scope.expand = function(clusterId) {
                $location.path('/clusters/expand/'+clusterId);
            };

            $scope.remove = function(clusterId) {
                ClusterService.remove(clusterId).then(function(result){
                    getAllClusters();
                });
            };

            $scope.isDeleteAvailable = function() {
                return _.filter($scope.clusters, function(cluster){
                    return cluster.selected;
                }).length;
            }
           
        };
        return ['$scope', '$location', '$interval', 'ClusterService', 'ServerService', 'VolumeService', 'PoolService', ClusterController];
    });
})();
