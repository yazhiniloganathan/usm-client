/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/volume-helpers', 'helpers/modal-helpers'], function(_, VolumeHelpers, ModalHelpers) {

        var PoolNewController = function($scope, $q, $log, $location, $modal, ClusterService, PoolService, RequestTrackingService) {
            var self = this;

            ClusterService.getList().then(function(clusters){
                self.clusters = _.filter(clusters, function(cluster) {
                    return cluster.cluster_type == 2;
                });

                if(self.clusters.length > 0) {
                    self.cluster = self.clusters[0];
                }
            });
            this.copyCountList = VolumeHelpers.getCopiesList();
            this.copyCount = VolumeHelpers.getRecomenedCopyCount();
            this.tierList = VolumeHelpers.getTierList();
            this.tier = this.tierList[0];

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
                console.log(pools);
                PoolService.create(pools).then(function(result) {
                    console.log(result);
                    if(result.status === 202) {
                        RequestTrackingService.add(result.data, 'Creating pool \'' + self.name + '\'');
                        var modal = ModalHelpers.SuccessfulRequest($modal, {
                            title: 'Create Pool Request is Submitted',
                            container: '.usmClientApp'
                        });
                        modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                            $hide();
                            $location.path('/pools');
                        });
                    }
                    else {
                        $log.error('Unexpected response from Pools.create', result);
                    }
                });
            };
        };
        return ['$scope', '$q', '$log', '$location', '$modal', 'ClusterService', 'PoolService', 'RequestTrackingService', PoolNewController];
    });
})();
