/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/mock-data-provider-helpers', 'helpers/cluster-helpers'], function(_, MockDataProviderHelpers, ClusterHelpers) {

        var HostController = function($scope, $interval, $location, ClusterService, ServerService) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });

            var self = this;
            this.list = [];
            this.selectAllHosts = false;
            
            var timer = $interval(reloadData, 10000);
            $scope.$on('$destroy', function() {
                $interval.cancel(timer);
            });
            reloadData();

            function reloadData() {
                ServerService.getList().then(function(hosts) {
                     _.each(hosts, function(host) {
                        var mockHost = MockDataProviderHelpers.getMockHost(host.node_name);
                        host.node_name = host.node_name.split(".")[0]; 
                        host.alerts = mockHost.alerts;
                        host.cpu_average = parseInt(Math.random()*100);
                        host.memory_average = parseInt(Math.random()*100);
                        host.cluster_type = 2;
                        if(host.cluster != null) {
                            ClusterService.get(host.cluster).then(function (cluster) {
                                 host.cluster_type = cluster.cluster_type;
                            });
                        }
                    });
                    self.list= hosts;
                });
            }

            this.getClusterTypeTitle = function(type) {
                return ClusterHelpers.getClusterType(type).type;
            };

            this.getNodeTypeTitle = function(node_type) {
                if(node_type === 1)
                    return 'Monitor Host';
                else if(node_type === 2)
                    return 'OSD Host';
                else if(node_type === 3)
                    return 'OSD and Monitor';
                else 
                    return 'Gluster Host';
            }

            this.getHostDonutColor = function(donut_value) {
                if (donut_value >= 90) return '#E35C5C';
                if (donut_value >= 80) return '#FF8C1B';
                else return '#4AD170';
            };

            this.remove = function(node_id) {
                ServerService.remove(node_id).then(function(result){
                    reloadData();
                    console.log(result);
                });
            };
            
        };
        return ['$scope', '$interval', '$location', 'ClusterService', 'ServerService', HostController];
    });
})();
