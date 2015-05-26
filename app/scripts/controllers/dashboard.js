(function () {
	'use strict;'
	define(['lodash', 'c3'], function(_, c3) {
        window.c3 = c3;
		var DashboardController = function($scope, $location, $log, ClusterService) {
            var self = this;
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });

            this.cluster = {};
            this.cluster.types = [
                { id:1, name: 'File', color: '#39a5dc', type: 'donut' },
                { id:2, name: 'Block', color: '#0088ce' ,type: 'donut' },
                { id:3, name: 'Object', color: '#00659c', type: 'donut' },
                { id:9, name: 'Free', color: '#969696', type: 'donut' }
            ];

            this.cluster.usages = [
                {'1': 2.5},
                {'2': 3.5},
                {'3': 2.0},
                {'9': 2.5}
            ];

            this.totalFreeSize = { size:2.5, unit: 'TB', percentage: 23.8 };
            this.totalUsedSize = { size:8.0, unit: 'TB', percentage: 76.2 };
            this.totalSize = { size:10.5, unit: 'TB' };

            this.cluster.trends = {};
            this.cluster.trends.cols = [
                { id:1, name: 'Used', color: '#39a5dc', type: 'area' }
            ];
            this.cluster.trends.values = [
                { '1': 10 },
                { '1': 12 },
                { '1': 14 },
                { '1': 16 },
                { '1': 18 },
            ];

            this.selectClusterUsageCategory = function(byType) {
                if(byType) {

                }
                else {

                }
            }

            this.selectClusterUsage = function(data) {
                $log.info(data);
                this.cluster.trends.values = this.getRandomList('1', 50, 100);
            };

            this.getRandomList = function(key, count, max) {
                var list = [];
                _.each(_.range(count), function(index) {
                    var value = {};
                    value[key] = _.random(0, max);
                    list.push(value);
                });
                return list;
            };

            this.cluster.trends.values = this.getRandomList('1', 50, 100);

            this.iopsList = [
                { name: 'MyCeph1', value: 354000 },
                { name: 'MyCeph2', value: 297000 },
                { name: 'MyCeph3', value: 123000 },
                { name: 'MyCluster1', value: 96000 },
                { name: 'MyCluster2', value: 92000 }
            ];

            this.bandwidthList = [
                { name: 'MyCeph1', value: 35000 },
                { name: 'MyCeph2', value: 27000 },
                { name: 'MyCeph3', value: 13000 },
                { name: 'MyCluster1', value: 9000 },
                { name: 'MyCluster2', value: 2000 }
            ];

            this.cpuList = [
                { name: 'Host1', value: 96 },
                { name: 'Host6', value: 89 },
                { name: 'Host2', value: 87 },
                { name: 'Host9', value: 84 },
                { name: 'Host3', value: 81 }
            ];

            this.memoryList = [
                { name: 'Host1', value: 98 },
                { name: 'Host6', value: 93 },
                { name: 'Host2', value: 88 },
                { name: 'Host9', value: 85 },
                { name: 'Host3', value: 78 }
            ];

            this.clusterList = [];
            _.each(_.range(6), function(index) {
                var cluster = {name: 'MyCeph'+index, pools: [], volumes: []};
                _.each(_.range(25), function(index) {
                    cluster.pools.push({id: _.random(0, 100), usage: _.random(0, 100)});
                });
                self.clusterList.push(cluster);
            });

            this.getHeatLevel = function(usage) {
                if(usage > 90) {
                    return 'heat-l0';
                }
                else if (usage > 80) {
                    return 'heat-l1';
                }
                else if (usage > 70) {
                    return 'heat-l2';
                }
                else {
                    return 'heat-l3';
                }
            };
		}
		return ['$scope', '$location', '$log', 'ClusterService', DashboardController];
	});
})();