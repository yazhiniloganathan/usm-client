/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers', 'helpers/modal-helpers'], function(_, ClusterHelpers, ModalHelpers) {

        var ClusterNewController = function($scope, $log, $modal, $location, $timeout, ClusterService, ServerService, OSDService, UtilService, RequestTrackingService, RequestService) {
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

            this.workloads = [
                { id:0, type: 'Generic' }
            ];
            this.workload = this.workloads[0];

            this.deploymentTypes = this.clusterType.deploymentTypes;
            this.deploymentType = this.deploymentTypes[0];

            this.onClusterTypeChanged = function() {
                this.deploymentTypes = this.clusterType.deploymentTypes;
                this.deploymentType = this.deploymentTypes[0];
            };

            this.newHost = {};
            this.hosts = [];
            this.osds = [];

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

            this.bulkSelectHosts = function() {
                _.each(this.hosts, function(host){
                    host.selected = true;
                });
            }

            this.toggleHostSelection = function(host) {
                if(host.state !== "ACCEPTED") {
                    host.selected = false;
                }
                else {
                    host.selected = !host.selected;
                }

                if(host.selected) {
                    ServerService.getStorageDevicesFree(host.id).then(function(disks) {
                        host.disks = disks;
                    });
                }
                else {
                    host.disks = [];
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

            this.onAddNewHost = function(newHost) {
                self.newHost.isVerifyingHost = true;
                self.newHost.errorMsg = "";
                self.newHost.cautionMsg = "";
                var hostObject = {
                 "host": newHost.ipaddress,
                 "port": 22,
                 "fingerprint": newHost.fingerprint,
                 "username": newHost.username,
                 "password": newHost.password
                }
                UtilService.getVerifyHost(hostObject)
                .then(function(){
                    var host = {
                        isMon:false,
                        hostname: newHost.hostname,
                        username: newHost.username,
                        password: newHost.password,
                        ipaddress: newHost.ipaddress,
                        fingerprint: newHost.fingerprint
                    };
                    self.hosts.unshift(host);
                    self.newHost.errorMsg = "";
                    self.newHost.cautionMsg = "";
                    self.newHost.isVerifyingHost = false;
                    self.postAddNewHost(host);
                    newHost.hostname = null;
                    newHost.username = null;
                    newHost.password = null;
                },
                function(){
                    self.newHost.cautionMsg = 'Authentication Error!.';
                    self.newHost.errorMsg = " The username and password is incorrect.";
                    self.newHost.isVerifyingHost = false;
                });
            }

            this.postAddNewHost = function(host) {
                ClusterHelpers.acceptNewHost(host, UtilService, RequestService, $log, $timeout);
            }

            this.onAcceptHost = function(host) {
                ClusterHelpers.acceptHost(host, UtilService, RequestService, $log, $timeout);
            };

            this.onRemoveHost = function(host) {
                _.remove(this.hosts, function(currenthost) {
                    return currenthost.hostname === host.hostname;
                });
            }

            this.getDisks = function() {
                var disks = [];
                _.each(this.hosts, function(host) {
                    if(host.selected) {
                        Array.prototype.push.apply(disks, host.disks);
                    }
                })
                return disks;
            }

            this.getDisksSize = function() {
                var disks = this.getDisks();
                var size = 0;
                return _.reduce(disks, function(size, disk) {
                    return disk.size + size;
                }, 0);
            }

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
                                    self.postClusterCreate(cluster, disks);
                                }
                                else {
                                    $log.info('Waiting for cluster \'' + self.clusterName + '\' to be ready');
                                    $timeout(callback, 5000);
                                }
                            });
                        };
                        if(self.clusterType.type === 'Ceph') {
                            $timeout(callback, 5000);
                        }
                    }
                    else {
                        $log.error('Unexpected response from Clusters.create', result);
                    }
                });
            };

            this.postClusterCreate = function(cluster, disks) {
                $log.info('Post Cluster Create');
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
                });
            };
        };
        return ['$scope', '$log', '$modal', '$location', '$timeout', 'ClusterService', 'ServerService', 'OSDService', 'UtilService', 'RequestTrackingService', 'RequestService', ClusterNewController];
    });
})();
