(function () {
	'use strict;'
	define(['lodash', 'numeral', 'c3'], function(_, numeral, c3) {
        window.c3 = c3;
		var DashboardController = function($scope, $location, $log, ClusterService, ServerService, VolumeService, PoolService) {
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

            self.totalCapacity = {
                freeGB: 0, usedGB: 0, totalGB: 0,
                freeFormatted: '0 B', usedFormatted: '0 B', totalFormatted: '0 B'
            };
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
                var totalFreeGB = 0;
                var totalUsedGB = 0;

                _.each(self.clusters, function(cluster) {
                    var used = byType[cluster.storage_type-1];
                    used = used + cluster.capacity.usedGB;
                    byType[cluster.storage_type-1] = used;
                    byTier[0] = byTier[0] + used;
                    totalFreeGB = totalFreeGB + cluster.capacity.freeGB;
                    totalUsedGB = totalUsedGB + cluster.capacity.usedGB;
                });

                 self.totalCapacity.byType = [
                    { '1': byType[0] },
                    { '2': byType[1] },
                    { '3': byType[2] },
                    { '9': totalFreeGB }
                ];

                 self.totalCapacity.byTier = [
                    { '1': byTier[0] },
                    { '2': byTier[1] },
                    { '3': byTier[2] },
                    { '9': totalFreeGB }
                ];

                self.totalCapacity.freeGB = totalFreeGB;
                self.totalCapacity.usedGB = totalUsedGB;
                self.totalCapacity.totalGB = totalFreeGB + totalUsedGB;
                //self.totalCapacity.usedPercentage = ((totalFreeGB * 100) / (totalUsedGB + totalFreeGB)).toFixed(0);
                self.totalCapacity.freeFormatted = numeral(totalFreeGB * 1073741824).format('0.0 b');
                self.totalCapacity.usedFormatted = numeral(totalUsedGB * 1073741824).format('0.0 b');
                self.totalCapacity.totalFormatted = numeral((totalFreeGB + totalUsedGB) * 1073741824).format('0.0 b');


                if(self.config.capacityByType) {
                    self.totalCapacity.legends = self.clusterTypes;
                    self.totalCapacity.values = self.totalCapacity.byType;
                }
                else {
                    self.totalCapacity.legends = self.storageTiers;
                    self.totalCapacity.values = self.totalCapacity.byTier;
                }
                self.trendCapacity.values = self.getRandomList('1', 50, totalUsedGB-(totalUsedGB * 0.1), totalUsedGB);
                self.trendCapacity.selected.used = totalUsedGB;
                self.trendCapacity.selected.usedFormatted = numeral(totalUsedGB * 1073741824).format('0.0 b');
            };

            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
                self.clusters = clusters;

                var requests = [];
                _.each(self.clusters, function(cluster) {
                    if(cluster.cluster_status === 1 || cluster.cluster_status === 2) {
                        self.clustersWarning.push(cluster);
                    }
                    else if(cluster.cluster_status === 5) {
                        self.clustersCritical.push(cluster);
                    }

                    cluster.capacity = { totalGB: 0, usedGB: 0, freeGB: 0 };
                    ClusterService.getCapacity(cluster.cluster_id).then(function(sizeGB) {
                        cluster.capacity.totalGB = sizeGB,
                        cluster.capacity.usedGB = cluster.used,
                        cluster.capacity.freeGB = cluster.capacity.totalGB - cluster.capacity.usedGB;
                        self.calculateTotalCapacity();
                    });

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

                    if(cluster.cluster_type === 1) {
                        VolumeService.getListByCluster(cluster.cluster_id).then(function(volumes) {
                            cluster.volumes = volumes;
                            cluster.volumes.push({ id: 100, usage: 75 });
                            _.each(_.range(cluster.volumes.length, 15), function(index) {
                                cluster.volumes.push({id: _.random(0, 100), usage: _.random(0, 70)});
                            });
                            _.each(_.range(cluster.volumes.length, 25), function(index) {
                                cluster.volumes.push({id: _.random(0, 100), usage: _.random(0, 95)});
                            });
                        });
                    }
                    else {
                        PoolService.getListByCluster(cluster.cluster_id).then(function(pools) {
                            cluster.pools = pools;
                            cluster.pools.push({ id: 100, usage: 75 });
                            _.each(_.range(cluster.pools.length, 15), function(index) {
                                cluster.pools.push({id: _.random(0, 100), usage: _.random(0, 70)});
                            });
                            _.each(_.range(cluster.pools.length, 25), function(index) {
                                cluster.pools.push({id: _.random(0, 100), usage: _.random(0, 95)});
                            });
                        });
                    }
                });
                self.calculateTotalCapacity();
            });

            ServerService.getList().then(function(hosts) {
                self.hosts = hosts;
                _.each(self.hosts, function(host) {
                    if(host.node_status === 1) {
                        self.hostsWarning.push(host);
                    }
                    var cpu = _.random(70, 85);
                    var memory = _.random(70, 85);
                    host.perf = { cpu: cpu, memory: memory };
                });
            });

            VolumeService.getList().then(function(volumes) {
                self.volumes = volumes;
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

            _.each(_.range(0, 10), function(index) {
                self.services.push({ id: index });
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
                var usedGB = isFreeSelected ? self.totalCapacity.usedGB : data.value;
                self.trendCapacity.values = this.getRandomList('1', 50, usedGB-(usedGB * 0.1), usedGB);
                self.trendCapacity.selected.used = usedGB;
                self.trendCapacity.selected.usedFormatted = numeral(usedGB * 1073741824).format('0 b');
                self.trendCapacity.selected.isTotal = isFreeSelected;
                self.trendCapacity.selected.type = data.name;
            };

            this.getRandomList = function(key, count, min, max) {
                var list = [];
                min = min > 0 ? min : 0;
                _.each(_.range(count), function(index) {
                    var value = {};
                    value[key] = _.random(min, max, true);
                    list.push(value);
                });
                return list;
            };

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
