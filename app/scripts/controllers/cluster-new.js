/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers', 'helpers/volume-helpers', 'helpers/modal-helpers'], function(_, ClusterHelpers, VolumeHelpers, ModalHelpers) {

        var ClusterNewController = function($scope, $q, $log, $modal, $location, $timeout, ClusterService, ServerService, VolumeService, OSDService, PoolService, UtilService, RequestTrackingService, RequestService) {
            this.step = 1;
            this.summaryHostsSortOrder = undefined;
            var self = this;
            this.sortHostsInSummary = function() {
                this.summaryHostsSortOrder = this.summaryHostsSortOrder === '-hostname' ? 'hostname': '-hostname';
            };

            this.storageTypes = ClusterHelpers.getStorageTypes();
            this.storageType = this.storageTypes[0];

            this.clusterTypes = ClusterHelpers.getClusterTypes();
            this.clusterType = this.clusterTypes[0];

            this.workloads = this.clusterType.workloads;
            this.workload = this.workloads[0];

            this.deploymentTypes = this.clusterType.deploymentTypes;
            this.deploymentType = this.deploymentTypes[0];

            this.onClusterTypeChanged = function() {
                this.deploymentTypes = this.clusterType.deploymentTypes;
                this.deploymentType = this.deploymentTypes[0];
                this.workloads = this.clusterType.workloads;
                this.workload = this.workloads[0];
            };

            this.newHost = {};
            this.hosts = [];
            this.disks = [];
            this.osds = [];
            this.volumes = [];
            this.newVolume = {};
            this.newVolume.copyCountList = VolumeHelpers.getCopiesList();
            this.newVolume.copyCount = VolumeHelpers.getRecomenedCopyCount();
            this.newVolume.sizeUnits = VolumeHelpers.getTargetSizeUnits();
            this.newVolume.sizeUnit = this.newVolume.sizeUnits[0];
            this.pools = [];
            this.newPool = {};
            this.newPool.copyCountList = VolumeHelpers.getCopiesList();
            this.newPool.copyCount = VolumeHelpers.getRecomenedCopyCount();

            ServerService.getDiscoveredHosts().then(function(freeHosts) {
                _.each(freeHosts, function(freeHost) {
                    var host = {
                        hostname: freeHost.node_name,
                        ipaddress: freeHost.management_ip,
                        state: "UNACCEPTED",
                        selected: false
                    };
                    self.hosts.push(host);
                    self.updateFingerprint(host);
                });
            });
            ServerService.getFreeHosts().then(function(freeHosts) {
                _.each(freeHosts, function(freeHost) {
                    var host = {
                        id: freeHost.node_id,
                        hostname: freeHost.node_name,
                        ipaddress: freeHost.management_ip,
                        state: "ACCEPTED",
                        selected: false
                    };
                    self.hosts.push(host);
                    self.updateFingerprint(host);
                });
            });

            this.selectAllHosts = function() {
                _.each(self.hosts, function(host){
                    self.selectHost(host, true);
                });
            }

            this.selectHost = function(host, selection) {
                if(host.state === "ACCEPTED") {
                    host.selected = selection;
                    if(host.selected) {
                        ServerService.getStorageDevicesFree(host.id).then(function(disks) {
                            host.disks = disks;
                            self.countDisks();
                        });
                    }
                    self.countDisks();
                }
            };

            this.updateFingerprint = function(host) {
                self.newHost.errorMsg = "";
                self.newHost.cautionMsg = "";
                UtilService.getIpAddress(host.hostname)
                .then(function(ipaddress){
                    host.ipaddress = ipaddress;
                    self.newHost.errorMsg = "";
                    self.newHost.cautionMsg = "";
                    return UtilService.getSshFingerprint(host.ipaddress);
                }, function(){
                    self.newHost.cautionMsg = "Error!.";
                    self.newHost.errorMsg = " Could not resolve the hostname";
                })
                .then(function(fingerprint) {
                    host.fingerprint = fingerprint;
                });
            }

            this.addNewHost = function() {
                ClusterHelpers.addNewHost(self, UtilService);
            }

            this.postAddNewHost = function(host) {
                ClusterHelpers.acceptNewHost(self, host, UtilService, RequestService, $log, $timeout);
            }

            this.acceptAllHosts = function() {
                _.each(self.hosts, function(host) {
                    if(host.state === "UNACCEPTED") {
                        self.acceptHost(host);
                    }
                });
            };

            this.acceptHost = function(host) {
                ClusterHelpers.acceptHost(self, host, UtilService, RequestService, $log, $timeout);
            };

            this.postAcceptHost = function(host) {
                if(host.id) {
                    self.selectHost(host, true);
                }
                else {
                    ServerService.getByHostname(host.hostname).then(function(hostFound) {
                        host.id = hostFound.node_id;
                        self.selectHost(host, true);
                    });
                }
            }

            this.removeHost = function(host) {
                _.remove(this.hosts, function(currenthost) {
                    return currenthost.hostname === host.hostname;
                });
            }

            this.countDisks = function() {
                var disks = [];
                _.each(self.hosts, function(host) {
                    if(host.selected) {
                        Array.prototype.push.apply(disks, host.disks);
                    }
                });
                self.disks = disks;
            }

            this.getDisks = function() {
                return self.disks;
            }

            this.getDisksSize = function() {
                var size = 0;
                return _.reduce(self.disks, function(size, disk) {
                    return disk.size + size;
                }, 0);
            }

            this.addNewVolume = function(newVolume) {
                var freeDisks = _.filter(this.disks, function(disk) {
                    return !disk.used;
                });
                var devicesMap = _.groupBy(freeDisks, function(disk) {
                    return disk.node;
                });
                var devicesList = _.map(devicesMap, function(disks) {
                    return disks;
                });
                var selectedDisks = VolumeHelpers.getStorageDervicesForVolumeBasic(newVolume.size, newVolume.copyCount, devicesList);
                _.each(selectedDisks, function(selectedDisk) {
                    selectedDisk.used = true;
                });
                newVolume.disks = selectedDisks;

                this.volumes.push(newVolume);
                this.newVolume = {};
                this.newVolume.copyCountList = VolumeHelpers.getCopiesList();
                this.newVolume.copyCount = VolumeHelpers.getRecomenedCopyCount();
                this.newVolume.sizeUnits = VolumeHelpers.getTargetSizeUnits();
                this.newVolume.sizeUnit = this.newVolume.sizeUnits[0];
            };

            this.addNewPool = function(newPool) {
                this.pools.push(newPool);
                this.newPool = {};
                this.newPool.copyCountList = VolumeHelpers.getCopiesList();
                this.newPool.copyCount = VolumeHelpers.getRecomenedCopyCount();
            };

            this.moveStep = function(nextStep) {
                this.step = (this.step === 1 && this.clusterName === undefined) ? this.step : this.step + nextStep;
            };

            this.isCancelAvailable = function() {
                return this.step === 1;
            };

            this.isSubmitAvailable = function() {
                return this.step === 4;
            };

            this.cancel = function() {
                $location.path('/clusters');
            };

            this.submit = function() {
                var hosts = [];
                _.forEach(this.hosts, function(host){
                    if(host.selected) {
                        var node_type = self.clusterType.id === 1 ? 4 : (host.isMon ? 1 : 2);
                        var localhost = {
                            node_name: host.hostname,
                            management_ip: host.ipaddress,
                            cluster_ip: host.ipaddress,
                            public_ip: host.ipaddress,
                            node_type: node_type
                        };
                        hosts.push(localhost);
                    }
                });

                var disks = this.getDisks();

                var volumes = this.volumes;

                var pools = this.pools;

                var cluster = {
                    cluster_name: this.clusterName,
                    cluster_type: this.clusterType.id,
                    storage_type: this.storageType.id,
                    nodes: hosts
                };
                ClusterService.create(cluster).then(function(result) {
                    console.log(result);
                    if(result.status === 202) {
                        RequestTrackingService.add(result.data, 'Creating cluster \'' + cluster.cluster_name + '\'');
                        var modal = ModalHelpers.SuccessfulRequest($modal, {
                            title: 'Create Cluster Request is Successful',
                            container: '.usmClientApp'
                        });
                        modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                            $hide();
                            $location.path('/clusters');
                        });
                        var callback = function() {
                            $log.info('Cluster create callback '+ result.data);
                            RequestService.get(result.data).then(function (request) {
                                if (request.status === 'FAILED' || request.status === 'FAILURE') {
                                    $log.info('Creating cluster \'' + self.clusterName + '\' is failed');
                                }
                                else if (request.status === 'SUCCESS'){
                                    $log.info('Cluster \'' + self.clusterName + '\' is created successfully');
                                    ClusterService.getByName(self.clusterName).then(function(result){
                                        cluster.cluster_id = result.cluster_id;
                                        self.postClusterCreate(cluster, disks, volumes, pools);
                                    });
                                }
                                else {
                                    $log.info('Waiting for cluster \'' + self.clusterName + '\' to be ready');
                                    $timeout(callback, 5000);
                                }
                            });
                        };
                        $timeout(callback, 5000);
                    }
                    else {
                        $log.error('Unexpected response from Clusters.create', result);
                    }
                });
            };

            this.postClusterCreate = function(cluster, disks, volumes, pools) {
                $log.info('Post Cluster Create');
                if(self.clusterType.type === 'Gluster') {
                    self.postGlusterClusterCreate(cluster, volumes);
                }
                else {
                    self.postCephClusterCreate(cluster, disks, pools);
                }
            };

            this.postGlusterClusterCreate = function(cluster, volumes) {
                var requests = [];

                _.each(volumes, function(volume) {
                    var localVolume = {
                        cluster: cluster.cluster_id,
                        volume_name: volume.name,
                        volume_type: 2,
                        replica_count: volume.copyCount,
                        bricks: []
                    };
                    _.each(volume.disks, function(device) {
                        var brick = {
                            node: device.node,
                            storage_device: device.storage_device_id
                        }
                        localVolume.bricks.push(brick);
                    });
                    requests.push(VolumeService.create(localVolume));
                });

                $q.all(requests).then(function(results) {
                    var index = 0;
                    while(index < results.length) {
                        if(results[index].status === 202) {
                            RequestTrackingService.add(results[index].data, 'Creating volume \'' + volumes[index].name);
                        }
                        index++;
                    }
                });
            }

            this.postCephClusterCreate = function(cluster, disks, pools) {
                var osdList = [];
                _.each(disks, function(disk) {
                    var osd = {
                        node: disk.node,
                        storage_device: disk.storage_device_id
                    };
                    osdList.push(osd);
                });
                var osds = {
                    osds: osdList
                };
                OSDService.create(osds).then(function(result) {
                    RequestTrackingService.add(result.data, 'Adding OSDs to cluster \'' + cluster.cluster_name + '\'');
                    var callback = function() {
                        $log.info('Adding OSDs callback '+ result.data);
                        RequestService.get(result.data).then(function (request) {
                            if (request.status === 'FAILED' || request.status === 'FAILURE') {
                                $log.info('Adding OSDs to cluster \'' + self.clusterName + '\' is failed');
                            }
                            else if (request.status === 'SUCCESS'){
                                $log.info('Adding OSDs to cluster \'' + self.clusterName + '\' is completed successfully');
                                self.createCephPools(cluster, disks, pools);
                            }
                            else {
                                $log.info('Waiting for OSDs to be added to cluster \'' + self.clusterName + '\'');
                                $timeout(callback, 5000);
                            }
                        });
                    };
                    $timeout(callback, 5000);
                });
            };

            this.createCephPools = function(cluster, disks, pools) {
                $log.info('Post OSD Create');
                var poolsRequest = {
                    cluster: cluster.cluster_id,
                    pools: []
                };
                _.each(pools, function(pool) {
                    poolsRequest.pools.push({
                        pool_name: pool.name,
                        pg_num: parseInt(pool.pgNum)
                    });
                });
                PoolService.create(poolsRequest).then(function(result) {
                    if(result.status === 202) {
                        RequestTrackingService.add(result.data, 'Creating pools in cluster \'' + cluster.cluster_name + '\'');
                    }
                    else {
                        $log.error('Unexpected response from Pools.create', result);
                    }
                });
            };
        };
        return ['$scope', '$q', '$log', '$modal', '$location', '$timeout', 'ClusterService', 'ServerService', 'VolumeService', 'OSDService', 'PoolService', 'UtilService', 'RequestTrackingService', 'RequestService', ClusterNewController];
    });
})();
