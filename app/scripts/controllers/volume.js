(function() {
    'use strict';
    define(['lodash', 'numeral', 'helpers/volume-helpers'], function(_, numeral, VolumeHelpers) {
        var VolumeController = function($scope, $q, $location, $interval, ClusterService, VolumeService) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });

            var self = this;
            self.reloading = false;
            this.list = [];
            this.selectAllVolumes = false;

            var timer = $interval(reloadData, 10000);
            $scope.$on('$destroy', function() {
                $interval.cancel(timer);
            });
            reloadData();

            function reloadData() {
                if(self.reloading) {
                    return;
                }

                self.reloading = true;
                VolumeService.getList().then(function(volumes) {
                    var selectedVolumes = _.filter(self.list, function(volume){
                        return volume.selected;
                    });
                    _.each(volumes, function(volume) {
                        var selected = _.find(selectedVolumes, function(selectedVolume){
                            return volume.volume_id === selectedVolume.volume_id;
                        });
                        volume.selected = !_.isUndefined(selected);
                    });

                    var requests = [];
                    _.each(volumes, function(volume) {
                        requests.push(VolumeService.getCapacity(volume.volume_id));
                    });
                    $q.all(requests).then(function(capacityList) {
                        var index = 0;
                        _.each(capacityList, function(capacity) {
                            volumes[index].capacity = capacity;
                            volumes[index].capacity.freeFormatted = self.formatSize(capacity.free);
                            volumes[index].capacity.totalFormatted = self.formatSize(capacity.total);
                            index++;
                        });
                        self.list = volumes;
                        self.reloading = false;
                    });
                    if(self.list.length === 0) {
                        self.list = volumes;
                    }
                });
            };

            this.formatSize = function(size) {
                return numeral(size).format('0.0 b');
            };

            this.getVolumeType = function(id) {
                return VolumeHelpers.getVolumeType(id).type;
            };

            this.getVolumeState = function(id) {
                return VolumeHelpers.getVolumeState(id).state;
            };

            this.create = function() {
                $location.path('/volumes/new');
            };

            this.expand = function(volume) {
                var selectedVolumes = _.filter(self.list, function(volume){
                    return volume.selected;
                });

                if(selectedVolumes.length>0) {
                    var selectedVolume = _.first(selectedVolumes);
                    $location.path('/volumes/expand/'+selectedVolume.volume_id);
                }
            };

            this.isDeleteAvailable = function() {
                return false;
            };
        };
        return ['$scope', '$q', '$location', '$interval', 'ClusterService', 'VolumeService', VolumeController];
    });
})();
