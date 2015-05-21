/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers', 'helpers/modal-helpers'], function(_, ClusterHelpers, ModalHelpers) {

        var ClusterExpandController = function($scope, $q, $log, $location, $routeParams, $modal, $timeout, ClusterService, ServerService, OSDService, UtilService, RequestTrackingService, RequestService) {
            var self = this;

            this.clusterId = $routeParams.id;

            ClusterService.get(this.clusterId).then(function(cluster) {
                self.cluster = cluster;
                self.name = cluster.cluster_name;
            });

            this.newHost = {};
            this.hosts = [];
            this.disks = [];
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

            this.isSubmitAvailable = function() {
                return true;
            };

            this.cancel = function() {
                $location.path('/clusters');
            };

            this.submit = function() {
                var hostPromises = [];
                var selectedHosts = [];
                var hostDisks = [];
                _.forEach(this.hosts, function(host){
                    if(host.selected) {
                        var node_type = self.cluster.cluster_type === 1 ? 4 : 2;
                        var localhost = {
                            cluster: self.clusterId,
                            node_name: host.hostname,
                            management_ip: host.ipaddress,
                            cluster_ip: host.ipaddress,
                            public_ip: host.ipaddress,
                            node_type: node_type
                        };
                        selectedHosts.push(host);
                        hostDisks.push(host.disks);
                        hostPromises.push(ServerService.add(localhost));
                    }
                });

                $q.all(hostPromises).then(function(tasks) {
                    var modal = ModalHelpers.SuccessfulRequest($modal, {
                        title: 'Expand Cluster Request is Submitted',
                        container: '.usmClientApp'
                    });
                    modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
                        $hide();
                        $location.path('/clusters');
                    });

                    var index = 0;
                    while(index < tasks.length) {
                        if(tasks[index].status === 202) {
                            var host = selectedHosts[index];
                            var disks = hostDisks[index];
                            var result = tasks[index];
                            RequestTrackingService.add(result.data, 'Adding host \'' + host.hostname + '\' to cluster');

                            var callback = function() {
                                $log.info('Cluster expand callback '+ result.data);
                                RequestService.get(result.data).then(function (request) {
                                    if (request.status === 'FAILED' || request.status === 'FAILURE') {
                                        $log.info('Adding host \'' + host.hostname + '\' is failed');
                                    }
                                    else if (request.status === 'SUCCESS'){
                                        $log.info('Host \'' + host.hostname + '\' is added successfully');
                                        self.postAddHost(self.cluster, host, disks);
                                    }
                                    else {
                                        $log.info('Waiting for host \'' + host.hostname + '\' to be added');
                                        $timeout(callback, 5000);
                                    }
                                });
                            };
                            $timeout(callback, 5000);
                        }
                        index++;
                    }
                });
            };

            this.postAddHost = function(cluster, host, disks) {
                $log.info("Post Add host");
                if(cluster.cluster_type === 2) {
                    self.postAddCephHost(cluster, host, disks);
                }
            };

            this.postAddCephHost = function(cluster, host, disks) {
                var osdList = [];
                _.each(disks, function(disk) {
                    if(!disk.inuse) {
                        var osd = {
                            node: disk.node,
                            storage_device: disk.storage_device_id
                        };
                        osdList.push(osd);
                    }
                });
                if(osdList.length > 0) {
                    var osds = {
                        osds: osdList
                    };
                    $log.info(osdList.length + " OSDs needs to be added to " + cluster.cluster_name);
                    OSDService.create(osds).then(function(result) {
                        if(result.status === 202) {
                            RequestTrackingService.add(result.data, 'Adding OSDs to cluster \'' + cluster.cluster_name + '\'');
                        }
                        else {
                            $log.error('Unexpected response from OSD.create', result);
                        }
                    });
                }
            };
        };
        return ['$scope', '$q', '$log', '$location', '$routeParams', '$modal', '$timeout', 'ClusterService', 'ServerService', 'OSDService', 'UtilService', 'RequestTrackingService', 'RequestService', ClusterExpandController];
    });
})();
