(function() {
    'use strict;'
    define(['lodash', 'numeral', 'c3', 'helpers/cluster-helpers', 'helpers/mock-data-provider-helpers'], function(_, numeral, c3, ClusterHelpers, MockDataProviderHelpers) {
        window.c3 = c3;
        var VolumeDetailController = function($q, $scope, $location, $log, $routeParams, VolumeService) {
            var self = this;
            self.id = $routeParams.id;
            this.volume = {};
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

            VolumeService.get(self.id).then(function (volume) {
                self.volume.name = volume.volume_name;
            });

            VolumeService.getCapacity(self.id).then(function (capacity) {
                self.capacity.total = self.formatSize(capacity.total);
                self.capacity.used = self.formatSize(capacity.total-capacity.free);
                self.capacity.free = self.formatSize(capacity.free);
                self.capacity.values = [
                    { '1': capacity.total*1073741824-capacity.free*1073741824 },
                    { '9': capacity.free*1073741824 }
                ];
                self.capacity.legends[0].color = self.getStatusColor((capacity.total*1073741824-capacity.free*1073741824)/(capacity.total*1073741824)*100);
                self.capacity.trends.values = MockDataProviderHelpers.getRandomList('1', 50, (capacity.total*1073741824-capacity.free*1073741824) * 0.1, (capacity.total*1073741824-capacity.free*1073741824), true);
            });
             
            this.formatSize = function(bytes) {
                return numeral(bytes).format('0.0 b');
            }

            this.mockVolume = MockDataProviderHelpers.getMockCluster();
            this.mockVolume.management_network.inbound = _.random(3,10);
            this.mockVolume.management_network.outbound = _.random(13,25);
            this.mockVolume.cluster_network.inbound = _.random(10,20);
            this.mockVolume.cluster_network.outbound = _.random(25,40);

            this.getStatusColor = function(value) {
                if (value >= 90) return '#E35C5C';
                if (value >= 80) return '#FF8C1B';
                else return '#4AD170';
            };

        }
        return ['$q', '$scope', '$location', '$log', '$routeParams', 'VolumeService', VolumeDetailController];
    });
})();

