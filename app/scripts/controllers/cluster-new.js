/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers', 'helpers/modal-helpers'], function(_, ClusterHelpers, ModalHelpers) {

        var ClusterNewController = function($scope, $log, $modal, $location, $timeout, ClusterService, ServerService, UtilService, RequestTrackingService, RequestService) {
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

            this.hosts = [];

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
                        hostname: freeHost.node_name,
                        ipaddress: freeHost.management_ip,
                        state: "ACCEPTED",
                        selected: false
                    };
                    self.hosts.push(host);
                    self.updateFingerprint(host);
                });
            });

            this.selectAllHosts = false;

            this.bulkSelectHosts = function() {
                this.selectAllHosts = !this.selectAllHosts;
                _.each(this.hosts, function(host){
                    host.selected = self.selectAllHosts;
                });
            }

            this.toggleHostSelection = function(host) {
                if(host.state !== "ACCEPTED") {
                    host.selected = false;
                }
                else {
                    host.selected = !host.selected;
                }
            };

            this.updateFingerprint = function(host) {
                self.errorMsg = "";
                self.cautionMsg = "";
                UtilService.getIpAddress(host.hostname)
                .then(function(ipaddress){
                    host.ipaddress = ipaddress;
                    self.errorMsg = "";
                    self.cautionMsg = "";
                    return UtilService.getSshFingerprint(host.ipaddress);
                }, function(){
                    self.cautionMsg = "Error!.";
                    self.errorMsg = " Could not resolve the hostname";
                })
                .then(function(fingerprint) {
                    host.fingerprint = fingerprint;
                });
            }

            this.onSaveNewHost = function(newHost) {
                self.isVerifyingHost = true;
                self.errorMsg = "";
                self.cautionMsg = "";
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
                    self.errorMsg = "";
                    self.cautionMsg = "";
                    self.isVerifyingHost = false;
                    self.onAddHost(host);
                    newHost.hostname = null;
                    newHost.username = null;
                    newHost.password = null;
                },
                function(){
                    self.cautionMsg = 'Authentication Error!.';
                    self.errorMsg = " The username and password is incorrect.";
                    self.isVerifyingHost = false;
                });
            }

            this.onAddHost = function(host) {
                var hosts = {
                    nodes: [
                        {
                            node_name: host.hostname,
                            management_ip: host.ipaddress,
                            ssh_username: host.username,
                            ssh_password: host.password,
                            ssh_key_fingerprint: host.fingerprint,
                            ssh_port: 22
                        }
                    ]
                };
                UtilService.acceptHosts(hosts).then(function(result) {
                    console.log(result);
                    host.state = "ACCEPTING";
                    host.task = result;
                    var callback = function() {
                        RequestService.get(result).then(function (request) {
                            if (request.status === 'FAILED' || request.status === 'FAILURE') {
                                $log.info('Failed to add host ' + host.hostname);
                                host.state = "FAILED";
                                host.task = undefined;
                            }
                            else if (request.status === 'SUCCESS'){
                                $log.info('Added host ' + host.hostname);
                                host.state = "ACCEPTED";
                                host.task = undefined;
                            }
                            else {
                                $log.info('Adding host ' + host.hostname);
                                $timeout(callback, 5000);
                            }
                        });
                    }
                    $timeout(callback, 5000);
                });
            }

            this.onAcceptHost = function(host) {
                var hosts = {
                    nodes: [
                        {
                            node_name: host.hostname,
                            management_ip: host.ipaddress
                        }
                    ]
                };
                UtilService.acceptHosts(hosts).then(function(result) {
                    console.log(result);
                    host.state = "ACCEPTING";
                    host.task = result;
                    var callback = function() {
                        RequestService.get(result).then(function (request) {
                            if (request.status === 'FAILED' || request.status === 'FAILURE') {
                                $log.info('Failed to accept host ' + host.hostname);
                                host.state = "FAILED";
                                host.task = undefined;
                            }
                            else if (request.status === 'SUCCESS'){
                                $log.info('Accepted host ' + host.hostname);
                                host.state = "ACCEPTED";
                                host.task = undefined;
                            }
                            else {
                                $log.info('Accepting host ' + host.hostname);
                                $timeout(callback, 5000);
                            }
                        });
                    }
                    $timeout(callback, 5000);
                });
            };

            this.onRemoveHost = function(host) {
                _.remove(this.hosts, function(currenthost) {
                    return currenthost.hostname === host.hostname;
                });
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
                    }
                    else {
                        $log.error('Unexpected response from Clusters.create', result);
                    }
                });
            };
        };
        return ['$scope', '$log', '$modal', '$location', '$timeout', 'ClusterService', 'ServerService', 'UtilService', 'RequestTrackingService', 'RequestService', ClusterNewController];
    });
})();
