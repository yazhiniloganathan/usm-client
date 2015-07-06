(function() {
    'use strict;'
    define(['lodash', 'numeral', 'c3', 'helpers/cluster-helpers', 'helpers/mock-data-provider-helpers'], function(_, numeral, c3, ClusterHelpers, MockDataProviderHelpers) {
        window.c3 = c3;
        var HostDetailController = function($q, $scope, $location, $log, $routeParams, ClusterService, ServerService) {
            var self = this;
            self.id = $routeParams.id;
            this.host = {};
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

            ServerService.get(self.id).then(function(host) {
                self.host.name = host.node_name.split(".")[0];
                if(host.cluster != null) {
                    ClusterService.get(host.cluster).then(function (cluster) {
                         self.host.type = ClusterHelpers.getClusterType(cluster.cluster_type);
                    });
                }
            });

            ServerService.getDiskStorageDevices(self.id).then(function(devices) {
                var totalSize = 0;
                var used = 0;
                _.each(devices, function(device) {
                    totalSize = totalSize + device.size;
                    if(device.inuse) {
                     used = used + device.size;
                    }
                });
                self.capacity.total = totalSize * 1073741824;
                self.capacity.used = used * 1073741824;
                self.capacity.free = self.capacity.total - self.capacity.used;
                self.capacity.values = [
                    { '1': self.capacity.used },
                    { '9': self.capacity.free }
                ];
                self.capacity.legends[0].color = self.getStatusColor(self.capacity.used/self.capacity.total*100);
                self.capacity.trends.values = MockDataProviderHelpers.getRandomList('1', 50, self.capacity.used * 0.1, self.capacity.used, true);
            });

            this.formatSize = function(bytes) {
                return numeral(bytes).format('0.0 b');
            }

            this.mockHost = MockDataProviderHelpers.getMockCluster();
            this.mockHost.management_network.inbound = _.random(3,10);
            this.mockHost.management_network.outbound = _.random(13,25);
            this.mockHost.cluster_network.inbound = _.random(10,20);
            this.mockHost.cluster_network.outbound = _.random(25,40);

            this.getStatusColor = function(value) {
                if (value >= 90) return '#E35C5C';
                if (value >= 80) return '#FF8C1B';
                else return '#4AD170';
            };

        }
        return ['$q', '$scope', '$location', '$log', '$routeParams', 'ClusterService', 'ServerService', HostDetailController];
    });
})();
