    /* global define */
    (function() {
        'use strict';
        define(['lodash', 'helpers/volume-helpers', 'helpers/modal-helpers'], function(_, VolumeHelpers, ModalHelpers) {

            var VolumeExpandController = function($scope, $q, $log, $location, $routeParams, $modal, ClusterService, ServerService, VolumeService, RequestTrackingService) {
                this.step = 1;
                var self = this;
                self.capacity = { 
                    percentage: 0,
                    used: 0,
                    total: 0,
                    unit: 0
                };
                self.newcapacity = {};
                this.volumeId = $routeParams.id;
                this.copyCountList = VolumeHelpers.getCopiesList();
                this.targetSizeUnits = VolumeHelpers.getTargetSizeUnits();
                this.targetSizeUnit = this.targetSizeUnits[0];
                this.storageDevices = [];
                this.actualSize = 0;

                this.calculateCapacity = function() {
                    this.newcapacity.total = this.capacity.total + parseInt(this.targetSize);
                    this.newcapacity.used = this.capacity.used;
                    var percentage = (this.newcapacity.used * 100) / this.newcapacity.total;
                    this.newcapacity.percentage = Math.round(percentage, -1);
                };

                this.getCapacityProgressColor = function(percentage) {
                    if(percentage >= 85) {
                        return "red";
                    }
                    else if(percentage >= 70) {
                        return "orange";
                    }
                    else {
                        return "green";
                    }
                };

                this.findStorageDevices = function() {
                    self.storageDevices = [];
                    self.actualSize = 0;
                    ServerService.getListByCluster(this.cluster).then(function(hosts) {
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
                        volume: self.volumeId,
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
                    VolumeService.expand(volume).then(function(result) {
                        console.log(result);
                        if(result.status === 202) {
                            RequestTrackingService.add(result.data, 'Expanding volume \'' + volume.volume_name + '\'');
                            var modal = ModalHelpers.SuccessfulRequest($modal, {
                                title: 'Expand Volume Request is Submitted',
                                container: '.usmClientApp'
                            });
                            modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                                $hide();
                                $location.path('/volumes');
                            });
                        }
                        else {
                            $log.error('Unexpected response from Volumes.expand', result);
                        }
                    });
                };

                //Initialize the data
                var promises = [VolumeService.get(this.volumeId), VolumeService.getBricks(this.volumeId)];

                $q.all(promises).then(function(results) {
                    var volume = results[0];
                    self.name = volume.volume_name;
                    self.copyCount = volume.replica_count;
                    self.cluster = volume.cluster_name;
                    self.status = volume.status;
                    self.capacity = { 
                        percentage: 75,
                        used: 45,
                        total: 60,
                        unit: "GB"
                    };
                    self.newcapacity = { 
                        percentage: 75,
                        used: 45,
                        total: 60,
                        unit: "GB"
                    };
                    self.bricks = results[1];
                });
            };
            return ['$scope', '$q', '$log', '$location', '$routeParams', '$modal', 'ClusterService', 'ServerService', 'VolumeService', 'RequestTrackingService', VolumeExpandController];
        });
    })();
