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

            var timer = $interval(reloadData, 5000);
            $scope.$on('$destroy', function() {
                $interval.cancel(timer);
            });
            reloadData();

            function reloadData() {
                PoolService.getList().then(function(pools) {
                    self.list = pools;
                });
            }

            this.create = function() {
                $location.path('/pools/new');
            };

            this.edit = function(pool_id) {
                $location.path('/pools/edit/'+pool_id);
            };

        };
        return ['$scope', '$location', '$interval', 'ClusterService', 'PoolService', PoolController];
    });
})();
