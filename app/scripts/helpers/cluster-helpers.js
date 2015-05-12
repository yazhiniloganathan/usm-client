/*global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var storageTypes = [
            { id:1, type:'Block' },
            { id:2, type:'File' },
            { id:3, type:'Object' }
        ];

        var clusterTypes = [
            {
                id:1,
                type:'Gluster',
                deploymentTypes: [
                    { id:1, type:'Demo (2 hosts)', nodeCount:2 },
                    { id:2, type:'Minimum (3 hosts)', nodeCount:3 },
                    { id:3, type:'Standard (6 hosts)', nodeCount:6 }
                ]
            },
            {
                id:2,
                type:'Ceph',
                deploymentTypes: [
                    { id:1, type:'Demo (2 hosts)', nodeCount:2 },
                    { id:2, type:'Minimum (3 hosts)', nodeCount:3 },
                    { id:3, type:'Standard (10 hosts)', nodeCount:10 }
                ]
            }
        ];

        var clusterStates = [
            { id:1, state:'Inactive'},
            { id:2, state:'Not Available'},
            { id:3, state:'Active'},
            { id:4, state:'Creating'},
            { id:5, state:'Failed'}
        ];

        function acceptHost(host, UtilService, RequestService, $log, $timeout) {
            var hosts = {
                nodes: [
                    {
                        node_name: host.hostname,
                        management_ip: host.ipaddress
                    }
                ]
            };
            UtilService.acceptHosts(hosts).then(function(result) {
                $log.info(result);
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

        function acceptNewHost(host, UtilService, RequestService, $log, $timeout) {
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
                $log.info(result);
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
        };

        return {
            getClusterTypes: function() {
                return clusterTypes;
            },
            getClusterType: function(id){
                return _.find(clusterTypes, function(type) {
                    return type.id === id;
                });
            },
            getStorageTypes: function() {
                return storageTypes;
            },
            getStorageType: function(id) {
                return _.find(storageTypes, function(type) {
                    return type.id === id;
                });
            },
            getClusterStatus: function(id) {
                return _.find(clusterStates, function(type) {
                    return type.id === id;
                });
            },
            acceptHost: acceptHost,
            acceptNewHost: acceptNewHost
        };
    });
})();
