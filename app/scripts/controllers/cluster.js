/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers', 'helpers/mock-data-provider-helpers', 'c3'], function(_, ClusterHelpers, MockDataProviderHelpers, c3) {
        window.c3 = c3;
        var ClusterController = function($scope, $location, $interval, ClusterService, ServerService, VolumeService, PoolService, $q) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });

            $scope.clusters = [];

            var timer = $interval(reloadData, 15000);
            $scope.$on('$destroy', function() {
                $interval.cancel(timer);
            });
            reloadData();

            var reloading = false;
            function reloadData() {
                if(reloading) {
                    return;
                }
                reloading = true;
                ClusterService.getList().then(function(clusters){
                     var tempClusters = [];
                     _.each(clusters, function(cluster) {
                        var mockCluster = MockDataProviderHelpers.getMockCluster(cluster.cluster_name);
                        var tempCluster = {
                            cluster_id : cluster.cluster_id,
                            cluster_name : cluster.cluster_name,
                            cluster_type : cluster.cluster_type,
                            storage_type : cluster.storage_type,
                            cluster_status : cluster.cluster_status,
                            used : cluster.used,
                            areaSpline_cols : [{ id:1, name: 'Used', color: '#39a5dc', type: 'area-spline' }],
                            areaSpline_values : mockCluster.areaSpline_values,
                            gauge_values : _.random(20, 70)/10,
                            alerts : mockCluster.alerts
                        };
                        if(tempCluster.used === 0) {
                            tempCluster.areaSpline_values = [{ '1': 0 }, { '1': 0 }];
                            tempCluster.gauge_values = 0.5;
                        }
                        if($scope.getClusterTypeTitle(cluster.cluster_type) === 'Gluster') {
                            VolumeService.getListByCluster(cluster.cluster_id).then(function (volumes) {
                                 tempCluster.no_of_volumes_or_pools = volumes.length;
                            });
                        }else {
                            PoolService.getListByCluster(cluster.cluster_id).then(function (pools) {
                                 tempCluster.no_of_volumes_or_pools = pools.length;
                            });
                        }
                        tempClusters.push(tempCluster);
                    });

                    var hosts = [];
                    var sizes = [];
                    _.each(tempClusters, function(cluster) {
                        hosts.push(ServerService.getListByCluster(cluster.cluster_id));
                        sizes.push(ClusterService.getCapacity(cluster.cluster_id));
                    });
                    $q.all(hosts).then(function(hostList) {
                        var index = 0;
                        _.each(hostList, function(host) {
                            tempClusters[index].no_of_hosts = host.length;
                            index++;
                        });
                    });
                    $q.all(sizes).then(function(sizeList) {
                        var index = 0;
                        _.each(sizeList, function(size) {
                            tempClusters[index].total_size = size;
                            tempClusters[index].free_size = size - tempClusters[index].used;
                            tempClusters[index].percent_used =  isNaN(Math.round(tempClusters[index].used*(100/size))) ? 0 : Math.round(tempClusters[index].used*(100/size));
                            index++;
                        });
                        $scope.clusters = tempClusters;
                        reloading = false;
                    });
                    if($scope.clusters.length === 0) {
                        $scope.clusters = tempClusters;
                    }
                });
            };

            $scope.getClusterGaugeColor = function(gauge_value) {
                gauge_value = gauge_value * 10;
                if (gauge_value >= 90) return '#E35C5C';
                if (gauge_value >= 80) return '#FF8C1B';
                else return '#4AD170';
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
                    reloadData();
                });
            };

        };
        return ['$scope', '$location', '$interval', 'ClusterService', 'ServerService', 'VolumeService', 'PoolService', '$q', ClusterController];
    });
})();
