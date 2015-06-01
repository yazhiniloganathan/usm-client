(function() {
    'use strict;'
    define(['lodash', 'numeral', 'c3', 'helpers/cluster-helpers', 'helpers/mock-data-provider-helpers'], function(_, numeral, c3, ClusterHelpers, MockDataProviderHelpers) {
        window.c3 = c3;
        var ClusterDetailController = function($q, $scope, $location, $log, $routeParams, ClusterService, ServerService, VolumeService, PoolService) {
            var self = this;
            self.id = $routeParams.id;
            this.cluster = {};
            this.capacity = { free: 0, used: 0, total: 0 };
            this.capacity.legends = [
                {  id: 1,  name: 'Used',  color: '#4AD170', type: 'donut'},
                {  id: 9,  name: 'Free',  color: '#CCCCCC', type: 'donut'}
            ];
            this.capacity.values = [];

            this.capacity.trends = {};
            this.capacity.trends.cols = [
                { id: 1, name: 'Used',  color: '#39a5dc', type: 'area-spline' }
            ];
            this.capacity.trends.values = [];

            this.iops = { reads: _.random(200, 700)/100, writes: _.random(100, 200)/100 };
            this.iops.total = this.iops.reads + this.iops.writes;
            this.iops.trends = {};
            this.iops.trends.cols = [
                { id: 1, name: 'Using', color: '#39a5dc', type: 'area' }
            ];
            this.iops.trends.values = MockDataProviderHelpers.getRandomList('1', 50, this.iops.writes, this.iops.total);

            ClusterService.get(self.id).then(function(cluster) {
                self.cluster.name = cluster.cluster_name;
                self.cluster.type = ClusterHelpers.getClusterType(cluster.cluster_type);
                self.capacity.used = cluster.used * 1073741824;

                ClusterService.getCapacity(self.id).then(function(capacity) {
                    self.capacity.total = capacity * 1073741824;
                    self.capacity.free = self.capacity.total - self.capacity.used;
                    self.capacity.values = [
                        { '1': self.capacity.used },
                        { '9': self.capacity.free }
                    ];
                    self.capacity.legends[0].color = self.getStatusColor(self.capacity.used/self.capacity.total*100);
                    self.capacity.trends.values = MockDataProviderHelpers.getRandomList('1', 50, self.capacity.used * 0.1, self.capacity.used, true);
                });
            });

            this.hosts = { total: 0, warning: 0, critical: 0 };
            this.volumes = { total: 0, warning: 0, critical: 0 };
            this.bricks = { total: 0, warning: 0, critical: 0 };
            this.pools = { total: 0, warning: 0, critical: 0 };
            this.pgs = { total: 1024, warning: 0, critical: 0 };
            this.osds = { total: 3, warning: 0, critical: 0 };

            ServerService.getListByCluster(self.id).then(function(hosts) {
                self.hosts.total = hosts.length;
                var warning = 0, critical = 0;
                _.each(hosts, function(host) {
                    if(host.node_status === 1) {
                        critical++;
                    }
                });
                self.hosts.critical = critical;
            });

            PoolService.getListByCluster(self.id).then(function(pools) {
                self.pools.total = pools.length;
            });

            var brickPromises = [];
            VolumeService.getListByCluster(self.id).then(function(volumes){
                self.volumes.total = volumes.length;
                var warning = 0, critical = 0;
                _.each(volumes, function(volume) {
                    if(volume.volume_status === 1) {
                        warning++;
                    }
                    else if(volume.volume_status === 2 || volume.volume_status === 3){
                        critical++;
                    }
                    brickPromises.push(VolumeService.getBricks(volume.volume_id));
                });
                self.volumes.critical = critical;
                self.volumes.warning = warning;
                return $q.all(brickPromises);
            }).then(function(bricks) {
                var total = 0, warning = 0, critical = 0;
                _.each(bricks,function(bricklist){
                    _.each(bricklist, function(brick) {
                        if(brick.brick_status === 1) {
                            warning++;
                        }
                        else if(brick.brick_status === 2 || brick.brick_status === 3){
                            critical++;
                        }
                            total++;
                    });
                });
                self.bricks.total = total;
                self.bricks.critical = critical;
                self.bricks.warning = warning;
            });

            this.cluster.volumes = [];
            _.each(_.range(0, 25), function(index) {
                self.cluster.volumes.push({id: _.random(0, 100), utilization: _.random(0, 100), performance: _.random(0, 100), uptime: _.random(0, 100)});
            });

            this.formatSize = function(bytes) {
                return numeral(bytes).format('0.0 b');
            }

            this.mockCluster = MockDataProviderHelpers.getMockCluster();
            this.mockCluster.management_network.inbound = _.random(3,10);
            this.mockCluster.management_network.outbound = _.random(13,25);
            this.mockCluster.cluster_network.inbound = _.random(10,20);
            this.mockCluster.cluster_network.outbound = _.random(25,40);

            this.getStatusColor = function(value) {
                if (value >= 90) return '#E35C5C';
                if (value >= 80) return '#FF8C1B';
                else return '#4AD170';
            };
            this.getHeatLevel = function(usage) {
                if (usage > 90) {
                    return 'heat-l0';
                } else if (usage > 80) {
                    return 'heat-l1';
                } else if (usage > 70) {
                    return 'heat-l2';
                } else {
                    return 'heat-l3';
                }
            };
        }
        return ['$q', '$scope', '$location', '$log', '$routeParams', 'ClusterService', 'ServerService', 'VolumeService', 'PoolService', ClusterDetailController];
    });
})();
