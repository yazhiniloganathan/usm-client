/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/volume-helpers', 'helpers/modal-helpers'], function(_, VolumeHelpers, ModalHelpers) {

        var VolumeNewController = function($scope, $q, $log, $location, $modal, ClusterService, ServerService, VolumeService, RequestTrackingService) {
            this.step = 1;
            var self = this;

            ClusterService.getList().then(function(clusters){
                self.clusters = _.filter(clusters, function(cluster) {
                    return cluster.cluster_type == 1;
                });

                if(self.clusters.length > 0) {
                    self.cluster = self.clusters[0];
                }
            });

            this.copyCountList = VolumeHelpers.getCopiesList();
            this.copyCount = VolumeHelpers.getRecomenedCopyCount();
            this.targetSizeUnits = VolumeHelpers.getTargetSizeUnits();
            this.targetSizeUnit = this.targetSizeUnits[0];
            this.tierList = VolumeHelpers.getTierList();
            this.tier = this.tierList[0];
            this.storageDevices = [];
            this.actualSize = 0;

            this.findStorageDevices = function() {
                self.storageDevices = [];
                self.actualSize = 0;
                ServerService.getListByCluster(this.cluster.cluster_id).then(function(hosts) {
                    var deviceRequests = [];
                    _.each(hosts, function(host){
                        deviceRequests.push(ServerService.getStorageDevicesFree(host.node_id, host.node_name));
                    });

                    var selectedDevices = [];
                    $q.all(deviceRequests).then(function(devicesList) {
                        selectedDevices = VolumeHelpers.getStorageDervicesForVolumeBasic(
                            self.targetSize, self.copyCount, devicesList);
                        self.storageDevices = selectedDevices;
                        self.actualSize = VolumeHelpers.getVolumeSize(
                            self.storageDevices, self.copyCount);
                    });
                });
            }

            this.moveStep = function(nextStep) {
                this.step = this.step + nextStep;
                if(this.step === 2) {
                    this.findStorageDevices();
                }
            };

            this.isCancelAvailable = function() {
                return this.step === 1;
            };

            this.isSubmitAvailable = function() {
                return this.step === 2;
            };

            this.cancel = function() {
                $location.path('/volumes');
            };

            this.submit = function() {
                var volume = {
                    cluster: self.cluster.cluster_id,
                    volume_name: self.name,
                    volume_type: 2,
                    replica_count: self.copyCount,
                    bricks: []
                };
                _.each(self.storageDevices, function(device) {
                    var brick = {
                        node: device.node,
                        storage_device: device.storage_device_id
                    }
                    volume.bricks.push(brick);
                });
                console.log(volume);
                VolumeService.create(volume).then(function(result) {
                    console.log(result);
                    if(result.status === 202) {
                        RequestTrackingService.add(result.data, 'Creating volume \'' + volume.volume_name + '\'');
                        var modal = ModalHelpers.SuccessfulRequest($modal, {
                            title: 'Create Volume Request is Successful',
                            container: '.usmClientApp'
                        });
                        modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                            $hide();
                            $location.path('/volumes');
                        });
                    }
                    else {
                        $log.error('Unexpected response from Volumes.create', result);
                    }
                });
            };
        };
        return ['$scope', '$q', '$log', '$location', '$modal', 'ClusterService', 'ServerService', 'VolumeService', 'RequestTrackingService', VolumeNewController];
    });
})();
