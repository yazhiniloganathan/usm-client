    /* global define */
    (function() {
        'use strict';
        define(['lodash', 'numeral', 'helpers/volume-helpers', 'helpers/modal-helpers'], function(_, numeral, VolumeHelpers, ModalHelpers) {

            var VolumeExpandController = function($scope, $q, $log, $location, $routeParams, $modal, ClusterService, ServerService, VolumeService, RequestTrackingService) {
                this.step = 1;
                var self = this;
                self.capacity = {
                    percentage: 0,
                    usedGB: 16,
                    total: 20,
                    unit: 'GB'
                };
                self.newcapacity = {};
                this.volumeId = $routeParams.id;
                this.copyCountList = VolumeHelpers.getCopiesList();
                this.targetSizeUnits = VolumeHelpers.getTargetSizeUnits();
                this.targetSizeUnit = this.targetSizeUnits[0];
                this.tierList = VolumeHelpers.getTierList();
                this.tier = this.tierList[0];
                this.storageDevices = [];
                this.actualSize = 0;

                this.calculateCapacity = function() {
                    var targetSize = this.targetSize.length > 0 ? parseInt(this.targetSize) : 0;
                    this.newcapacity.totalGB = this.capacity.totalGB + targetSize;
                    var percentage = (this.newcapacity.usedGB * 100) / this.newcapacity.totalGB;
                    this.newcapacity.percentage = Math.round(percentage, -1);
                    this.newcapacity.totalFormatted = numeral(this.newcapacity.totalGB * 1073741824).format('0 b');
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
                            RequestTrackingService.add(result.data, 'Expanding volume \'' + self.name + '\'');
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
                var promises = [VolumeService.get(this.volumeId), VolumeService.getCapacity(this.volumeId)];

                $q.all(promises).then(function(results) {
                    var volume = results[0];
                    self.name = volume.volume_name;
                    self.copyCount = volume.replica_count;
                    self.cluster = volume.cluster;
                    self.cluster_name = volume.cluster_name;
                    self.status = volume.status;

                    var capacity = results[1];
                    self.capacity = {
                        freeGB: capacity.free / 1073741824,
                        totalGB: capacity.total / 1073741824,
                        usedGB: capacity.totalGB - capacity.freeGB,
                    };
                    self.capacity.usedGB = self.capacity.totalGB - self.capacity.freeGB;
                    var percentage = (self.capacity.usedGB * 100) / self.capacity.totalGB;
                    self.capacity.percentage = Math.round(percentage, -1);
                    self.capacity.totalFormatted = numeral(capacity.total).format('0 b');
                    self.capacity.usedFormatted = numeral(capacity.total - capacity.free).format('0 b');

                    self.newcapacity = {
                        freeGB: self.capacity.freeGB,
                        usedGB: self.capacity.usedGB,
                        totalGB: self.capacity.totalGB,
                        percentage: self.capacity.percentage,
                        usedFormatted: self.capacity.usedFormatted,
                        totalFormatted: self.capacity.totalFormatted
                    };
                });
            };
            return ['$scope', '$q', '$log', '$location', '$routeParams', '$modal', 'ClusterService', 'ServerService', 'VolumeService', 'RequestTrackingService', VolumeExpandController];
        });
    })();
