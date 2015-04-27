(function() {
    'use strict';
    define(['lodash', 'helpers/volume-helpers'], function(_, VolumeHelpers) {
        var VolumeController = function($scope, $location, $interval, ClusterService, VolumeService) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });

            var self = this;
            this.list = [];
            this.selectAllVolumes = false;

            var timer = $interval(reloadData, 5000);
            $scope.$on('$destroy', function() {
                $interval.cancel(timer);
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
                });
            }

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
        return ['$scope', '$location', '$interval', 'ClusterService', 'VolumeService', VolumeController];
    });
})();