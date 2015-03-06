/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers'], function(_, ClusterHelpers) {

        var ClusterNewController = function($scope, $modal, $location, $http) {
            this.step = 1;
            var self = this;
            this.clusterTypes = ClusterHelpers.getClusterTypes();
            this.clusterType = this.clusterTypes[0];

            this.storageTypes = ClusterHelpers.getStorageTypes();
            this.storageType = this.storageTypes[0];

            this.hosts = [];
            this.hosts.push({isDummy:true, isNew:true, isEdit:false});

            this.onAddRow = function(host) {
                host.isDummy = false;
                host.isEdit = true;
                this.hosts.push({isDummy:true, isNew:true, isEdit:false});
            }

            this.updateFingerprint = function(host) {
                var delim = "-";

                function S4() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                }
                host.fingerprint = (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
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
                this.step = this.step + nextStep;
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
                    var localhost = {
                        node_name: host.hostname,
                        management_ip: host.hostname,
                        cluster_ip: host.hostname,
                        public_ip: host.hostname,
                        ssh_username: host.username,
                        ssh_password: host.password,
                        ssh_key_fingerprint: "FINGER",
                        ssh_port: 22,
                        node_type: "1"
                    };
                    hosts.push(localhost);
                });

                var cluster = {
                    cluster_name: this.clusterName,
                    cluster_type: this.clusterType.id,
                    storage_type: this.storageType.id,
                    nodes: hosts
                };

                $http.post('http://10.70.42.87:8000/api/v1/create_cluster', cluster).
                  success(function (data, status, headers, config) {
                    console.log(status);
                  }).
                  error(function (data, status, headers, config) {
                    console.log(status);
                  });

                $location.path('/clusters');
            };
        };
        return ['$scope', '$modal', '$location', '$http', ClusterNewController];
    });
})();