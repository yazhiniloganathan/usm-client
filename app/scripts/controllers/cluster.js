/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers', 'c3'], function(_, ClusterHelpers, c3) {
        window.c3 = c3;
        var ClusterController = function($scope, $location, $interval, ClusterService, ServerService, VolumeService, PoolService) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });

            $scope.clusters = [];
   
            /* Hard code data for demo purpose */
            function getRandomNumber() {
                var randomNumber = parseInt(Math.random()*100);
                var resultData = {};
                resultData.percentage = randomNumber;
                if(0<=randomNumber && randomNumber<=75)
                {
                   resultData.color = 'green';
                
                }else if(76<=randomNumber && randomNumber<=85)
                {
                   resultData.color = 'orange';
                }else if(85<=randomNumber && randomNumber<=99)
                {
                   resultData.color = 'red';
                }
                return resultData;
            }
            /* End Hard code data for demo purpose */

            getAllClusters();

            function getAllClusters() {
                $scope.clusters = [];
                ClusterService.getList().then(function(clusters){
                    _.each(clusters, function(cluster) {
                        var randomObject = getRandomNumber();
                        var tempCluster = {
                            cluster_id : cluster.cluster_id,
                            cluster_name : cluster.cluster_name,
                            cluster_type : cluster.cluster_type,
                            storage_type : cluster.storage_type,
                            cluster_status : cluster.cluster_status,
                            description : cluster.description,
                            no_of_hosts : 0,
                            no_of_volumes_or_pools : 0,
                            data_used : parseInt(Math.random()*100+1),
                            alerts : parseInt(Math.random()*10),
                            areaSpline_cols : [{ id:1, name: 'Used', color: '#39a5dc', type: 'area-spline' }],
                            areaSpline_values : [ { '1': parseInt(Math.random()*10+1) }, { '1': parseInt(Math.random()*10+1) }, { '1': parseInt(Math.random()*100+1) }, { '1': parseInt(Math.random()*100+1) }, { '1': parseInt(Math.random()*100+1) }],
                            gauge_cols : [ { id:1, name: 'Used', color: randomObject.color, type: 'gauge' }],
                            gauge_values : [{ '1': randomObject.percentage }]
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
