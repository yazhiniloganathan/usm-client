/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/volume-helpers', 'helpers/modal-helpers'], function(_, VolumeHelpers, ModalHelpers) {

        var PoolEditController = function($scope, $q, $log, $location, $routeParams, $modal, ClusterService, PoolService, RequestTrackingService) {
            var self = this;
            ClusterService.getList().then(function(clusters){
                self.clusters = _.filter(clusters, function(cluster) {
                    return cluster.cluster_type == 2;
                });

                if(self.clusters.length > 0) {
                    self.cluster = self.clusters[0];
                }
            });
            this.poolId = $routeParams.id;
            this.copyCountList = VolumeHelpers.getCopiesList();
            this.copyCount = VolumeHelpers.getRecomenedCopyCount();
            this.tierList = VolumeHelpers.getTierList();
            this.tier = this.tierList[0];

            var promises = [PoolService.get(this.poolId)];
                $q.all(promises).then(function(results) {
                    var pool = results[0];
                    self.name = pool.pool_name;
                    self.clusterName = pool.cluster_name;
                });
            
            this.isSubmitAvailable = function() {
                return true;
            };

            this.cancel = function() {
                $location.path('/pools');
            };

            this.submit = function() {
                var pools = {
                    cluster: self.cluster.cluster_id,
                    pools: [
                        {
                            pool_name: this.name,
                            pg_num: parseInt(this.pg_num)
                        }
                    ]
                };

                PoolService.update(pools).then(function(result) {
                    console.log(result);
                    if(result.status === 202) {
                        RequestTrackingService.add(result.data, 'Updating pool \'' + self.name + '\'');
                        var modal = ModalHelpers.SuccessfulRequest($modal, {
                            title: 'Update Pool Request is Submitted',
                            container: '.usmClientApp'
                        });
                        modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                            $hide();
                            $location.path('/pools');
                        });
                    }
                    else {
                        $log.error('Unexpected response from Pools.update', result);
                    }
                });

            };
        };
        return ['$scope', '$q', '$log', '$location', '$routeParams', '$modal', 'ClusterService', 'PoolService', 'RequestTrackingService', PoolEditController];
    });
})();
