/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers', 'helpers/modal-helpers'], function(_, ClusterHelpers, ModalHelpers) {

        var ClusterNewController = function($scope, $log, $modal, $location, ClusterService, ServerService, UtilService, RequestTrackingService) {
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

            ServerService.getFreeHosts().then(function(freeHosts) {
                _.each(freeHosts, function(freeHost) {
                    var host = {
                        hostname: freeHost.node_name,
                        ipaddress: freeHost.management_ip,
                        isNew: false,
                        isDummy: false
                    };
                    self.hosts.push(host);
                    self.updateFingerprint(host);
                });
               self.hosts.push({isDummy:true, isNew:true, isEdit:false});
               
            });

            this.selectAllHosts = false;

            this.bulkSelectHosts = function() {
                this.selectAllHosts = !this.selectAllHosts;
                _.each(this.hosts, function(host){
                    if(!host.isDummy) {
                        host.selected = self.selectAllHosts;
                    }
                });
            }

            this.onAddRow = function(host) {
                host.isDummy = false;
                host.isEdit = true;
                host.isMon = false;
                this.hosts.push({isDummy:true, isNew:true, isEdit:false});
            }

            this.onSaveNewHost = function(newHost) {
                this.hosts.unshift({isDummy:false, isNew:true, isEdit:false, isMon:false, hostname:newHost.hostname, username:newHost.username, password:newHost.password, ipaddress:newHost.ipaddress, fingerprint:newHost.fingerprint});
                newHost.hostname = null;
                newHost.username = null;
                newHost.password = null;
            }

            this.updateFingerprint = function(host) {
                UtilService.getIpAddress(host.hostname)
                .then(function(ipaddress){
                    host.ipaddress = ipaddress;
                    self.errorMsg = '';
                    return UtilService.getSshFingerprint(host.ipaddress);
                }, function(){
                    self.errorMsg = " Could not resolve the hostname";
                })
                .then(function(fingerprint) {
                    host.fingerprint = fingerprint;
                });
            }

            this.onEditHost = function(host) {
                host.isEdit = true;
            }

            this.onSaveHost = function(host) {
                host.isEdit = false;
            }

            this.onRemoveHost = function(host) {
                _.remove(this.hosts, function(currenthost) {
                    return !currenthost.isDummy && currenthost.hostname === host.hostname;
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
                    if(!host.isDummy && host.selected) {
                        var node_type = self.clusterType.id === 1 ? 4 : (host.isMon ? 1 : 2);
                        var localhost = {
                            node_name: host.hostname,
                            management_ip: host.ipaddress,
                            cluster_ip: host.ipaddress,
                            public_ip: host.ipaddress,
                            ssh_key_fingerprint: host.fingerprint,
                            ssh_port: 22,
                            node_type: node_type
                        };
                        if(host.isNew) {
                            localhost.ssh_username = host.username;
                            localhost.ssh_password = host.password;
                        }
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
        return ['$scope', '$log', '$modal', '$location', 'ClusterService', 'ServerService', 'UtilService', 'RequestTrackingService', ClusterNewController];
    });
})();
