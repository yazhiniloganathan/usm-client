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
            self.first = true;
            this.list = [];
            this.capacityMap = {};

            var timer1 = $interval(reloadData, 5000);
            var timer2 = $interval(reloadCapacity, 60000);
            $scope.$on('$destroy', function() {
                $interval.cancel(timer1);
                $interval.cancel(timer2);
            });
            reloadData();

            function reloadData() {
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

                    self.list = volumes;

                    if(self.first) {
                        reloadCapacity();
                    }
                    else {
                        self.updateCapacity();
                    }
                    self.first = false;
                });
            };

            function reloadCapacity() {
                var volumes = self.list.slice(0);
                if(volumes.length === 0) {
                    return;
                }

                var updateCapacity = function(capacity) {
                    capacity.freeFormatted = self.formatSize(capacity.free);
                    capacity.totalFormatted = self.formatSize(capacity.total);
                    self.capacityMap[capacity.volumeId] = capacity;
                };

                var findCapacity = function(volumes, volume) {
                    VolumeService.getCapacity(volume.volume_id).then(function (capacity) {
                        updateCapacity(capacity);
                        if(volumes.length > 0) {
                            var nextVolume = volumes[0];
                            findCapacity(_.rest(volumes), nextVolume);
                        }
                        else {
                            self.updateCapacity();
                        }

                    });
                };
                var volume = volumes[0];
                findCapacity(_.rest(volumes), volume);
            }

            this.updateCapacity = function() {
                _.each(self.list, function(volume) {
                    volume.capacity = self.capacityMap[volume.volume_id];
                });
            }

            this.formatSize = function(size) {
                return numeral(size ? size : 0).format('0.0 b');
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
