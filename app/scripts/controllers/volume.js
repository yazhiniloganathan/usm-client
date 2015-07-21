(function() {
    'use strict';
    define(['lodash', 'numeral', 'helpers/volume-helpers', 'helpers/mock-data-provider-helpers', 'helpers/cluster-helpers'], function(_, numeral, VolumeHelpers, MockDataProviderHelpers, ClusterHelpers) {
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
            
            var timer1 = $interval(reloadData, 10000);
            var timer2 = $interval(reloadCapacity, 60000);
            $scope.$on('$destroy', function() {
                $interval.cancel(timer1);
                $interval.cancel(timer2);
            }); 

            reloadData();

            function reloadData() {
                VolumeService.getList().then(function(volumes) {
                     _.each(volumes, function(volume) {
                        var mockVolume = MockDataProviderHelpers.getMockVolume(volume.volume_name);
                        volume.areaSpline_cols = [{ id:1, name: 'Used', color: '#39a5dc', type: 'area-spline' }];
                        volume.areaSpline_values = mockVolume.areaSpline_values;
                        volume.alerts = mockVolume.alerts;
                        VolumeService.getBricks(volume.volume_id).then(function (bricks) {
                             volume.bricks = bricks.length;
                        });
                        if(volume.cluster != null) {
                            ClusterService.get(volume.cluster).then(function (cluster) {
                                 volume.cluster_type = cluster.cluster_type;
                            });
                        }
                    });
                    self.list= volumes;
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
                    var percent_used = (100  - (( ( capacity.free/1073741824 ) * 100) / ( capacity.total/1073741824 ))) ;
                    capacity.percent_used = isNaN(percent_used) ? 0 : percent_used;
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

            this.getClusterTypeTitle = function(type) {
                if(type !== undefined)
                return ClusterHelpers.getClusterType(type).type;
            };

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

            this.expand = function(volume_id) {
              $location.path('/volumes/expand/'+volume_id);
            };

            this.isDeleteAvailable = function() {
                return false;
            };

            this.remove = function(volume_id) {
                return VolumeService.delete(volume_id);
            };
        };
        return ['$scope', '$q', '$location', '$interval', 'ClusterService', 'VolumeService', VolumeController];
    });
})();
