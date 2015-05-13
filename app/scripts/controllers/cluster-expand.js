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

            this.onAddNewHost = function() {
                ClusterHelpers.addNewHost(self, UtilService);
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

            this.isSubmitAvailable = function() {
                return true;
            };

            this.cancel = function() {
                $location.path('/clusters');
            };

            this.submit = function() {
                var hostPromises = [];
                var selectedHosts = [];
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
                            RequestTrackingService.add(tasks[index].data, 'Adding host \'' + selectedHosts[index].hostname + '\' to cluster');                        
                        }
                        index++;
                    }
                });
            };
        };
        return ['$scope', '$q', '$log', '$location', '$routeParams', '$modal', '$timeout', 'ClusterService', 'ServerService', 'OSDService', 'UtilService', 'RequestTrackingService', 'RequestService', ClusterExpandController];
    });
})();
