(function() {
    'use strict';
    define(['lodash', 'helpers/volume-helpers'], function(_, VolumeHelpers) {
        var PoolController = function($scope, $location, $interval, ClusterService, PoolService) {
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
                PoolService.getList().then(function(pools) {
                    var selectedPools = _.filter(self.list, function(pool){
                        return pool.selected;
                    });
                    _.each(pools, function(pool) {
                        var selected = _.find(selectedPools, function(selectedPool){
                            return pool.pool_id === selectedPool.pool_id;
                        });
                        pool.selected = !_.isUndefined(selected);
                    });
                    self.list = pools;
                });
            }

            this.create = function() {
                $location.path('/pools/new');
            };

            this.isDeleteAvailable = function() {
                return false;
            };
        };
        return ['$scope', '$location', '$interval', 'ClusterService', 'PoolService', PoolController];
    });
})();
