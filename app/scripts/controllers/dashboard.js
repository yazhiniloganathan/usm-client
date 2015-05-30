(function () {
	'use strict;'
	define(['lodash', 'numeral', 'c3'], function(_, numeral, c3) {
        window.c3 = c3;
		var DashboardController = function($scope, $location, $log, ClusterService, ServerService, PoolService, VolumeService) {
            var self = this;
            self.config = { capacityByType: true, capacityByTier: false };
            self.clusters = [];
            self.clustersWarning = [];
            self.clustersCritical = [];
            self.hosts = [];
            self.hostsWarning = [];
            self.hostsCritical = [];
            self.volumes = [];
            self.volumesWarning = [];
            self.volumesCritical = [];
            self.pools = [];
            self.poolsWarning = [];
            self.poolsCritical = [];
            self.services = [];
            self.servicesWarning = [];
            self.servicesCritical = [];

            self.clusterTypes = [
                { id:1, name: 'Block', color: '#48b3ea', type: 'donut' },
                { id:2, name: 'File', color: '#0088ce' ,type: 'donut' },
                { id:3, name: 'Object', color: '#00659c', type: 'donut' },
                { id:9, name: 'Free', color: '#969696', type: 'donut' }
            ];
            self.storageTiers = [
                { id:1, name: 'Default', color: '#48b3ea', type: 'donut' },
                { id:2, name: 'Faster', color: '#0088ce', type: 'donut' },
                { id:3, name: 'Slower', color: '#00659c', type: 'donut' },
                { id:9, name: 'Free', color: '#969696', type: 'donut' }
            ];

            self.totalCapacity = { free: 0, used: 0, unit: 'TB', usedPercentage:100 };
            self.totalCapacity.legends = self.clusterTypes;
            self.totalCapacity.values = [];
            self.totalCapacity.byType = [];
            self.totalCapacity.byTier = [];

            self.trendCapacity = {};
            self.trendCapacity.legends = [
                { id:1, name: 'Used', color: '#39a5dc', type: 'area-spline' }
            ];
            self.trendCapacity.values = [];
            self.trendCapacity.selected = { used: 0, isTotal: true, type: '' };


            this.calculateTotalCapacity = function() {
                var byType = [0, 0, 0]; // block, file, object
                var byTier = [0, 0, 0]; // default, fast, slower
                var totalFree = 0;
                var totalUsed = 0;

                _.each(self.clusters, function(cluster) {
                    var used = byType[cluster.storage_type-1];
                    used = used + cluster.capacity.used;
                    byType[cluster.storage_type-1] = used;
                    byTier[0] = byTier[0] + used;
                    totalFree = totalFree + cluster.capacity.free;
                    totalUsed = totalUsed + cluster.capacity.used;
                });

                 self.totalCapacity.byType = [
                    { '1': byType[0] },
                    { '2': byType[1] },
                    { '3': byType[2] },
                    { '9': totalFree }
                ];

                 self.totalCapacity.byTier = [
                    { '1': byTier[0] },
                    { '2': byTier[1] },
                    { '3': byTier[2] },
                    { '9': totalFree }
                ];

                self.totalCapacity.free = totalFree;
                self.totalCapacity.used = totalUsed;
                self.totalCapacity.usedPercentage = ((totalFree * 100) / (totalUsed + totalFree)).toFixed(0);

                if(self.config.capacityByType) {
                    self.totalCapacity.legends = self.clusterTypes;
                    self.totalCapacity.values = self.totalCapacity.byType;
                }
                else {
                    self.totalCapacity.legends = self.storageTiers;
                    self.totalCapacity.values = self.totalCapacity.byTier;
                }
                self.trendCapacity.values = self.getRandomList('1', 50, totalUsed-2, totalUsed);
                self.trendCapacity.selected.used = totalUsed;
            };

            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
                self.clusters = clusters;

                _.each(self.clusters, function(cluster) {
                    if(cluster.cluster_status === 1 || cluster.cluster_status === 2) {
                        self.clustersWarning.push(cluster);
                    }
                    else if(cluster.cluster_status === 5) {
                        self.clustersCritical.push(cluster);
                    }
                    var free = parseInt(_.random(6, 15.2).toFixed(2));
                    var used = parseInt(_.random(6, 15.2).toFixed(2));
                    cluster.capacity = { free: free, used: used };
                    cluster.capacity.total = cluster.capacity.free + cluster.capacity.used;

                    var iops = _.random(30000,60000);
                    var iopsFormatted = numeral(iops).format('0,0');
                    var bandwidth = _.random(500, 1500);
                    var bandwidthFormatted = numeral(bandwidth).format('0,0');
                    cluster.perf = {
                        iops: iops,
                        iopsFormatted: iopsFormatted,
                        bandwidth: bandwidth,
                        bandwidthFormatted: bandwidthFormatted
                    };
                });
                self.calculateTotalCapacity();
            });

            ServerService.getList().then(function(hosts) {
                self.hosts = hosts;
                _.each(self.hosts, function(host) {
                    if(host.node_status == 2) {
                        self.hostsWarning.push(host);
                    }
                    var cpu = _.random(70, 100);
                    var memory = _.random(70, 100);
                    host.perf = { cpu: cpu, memory: memory };
                });
            });

            VolumeService.getList().then(function(volumes) {
                self.volumes = volumes;
                self.services = [];
                _.each(self.volumes, function(volume) {
                    if(volume.volume_status === 1) {
                        volumesWarning.push(volume);
                    }
                    else if(volume.volume_status === 2) {
                        volumesCritical.push(volume);
                    }
                });
            });

            PoolService.getList().then(function(pools) {
                self.pools = pools;
            });

            this.switchCapacityCategory = function(execute) {
                if(execute) {
                    self.config.capacityByType = !self.config.capacityByType;
                    self.config.capacityByTier = !self.config.capacityByTier;
                    if(self.config.capacityByType) {
                        self.totalCapacity.legends = self.clusterTypes;
                        self.totalCapacity.values = self.totalCapacity.byType;
                    }
                    else {
                        self.totalCapacity.legends = self.storageTiers;
                        self.totalCapacity.values = self.totalCapacity.byTier;
                    }
                }
            }

            this.selectClusterCapacityLegend = function(data) {
                var isFreeSelected = data.id === '9';
                var used = isFreeSelected ? self.totalCapacity.used : data.value;
                self.trendCapacity.values = this.getRandomList('1', 50, used-2, used);
                self.trendCapacity.selected.used = used;
                self.trendCapacity.selected.isTotal = isFreeSelected;
                self.trendCapacity.selected.type = data.name;
            };

            this.getRandomList = function(key, count, min, max) {
                var list = [];
                _.each(_.range(count), function(index) {
                    var value = {};
                    value[key] = _.random(min, max, true);
                    list.push(value);
                });
                return list;
            };

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
		return ['$scope', '$location', '$log', 'ClusterService', 'ServerService', 'VolumeService', 'PoolService', DashboardController];
	});
})();
