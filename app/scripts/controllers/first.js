/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/modal-helpers'], function(_) {

        var FirstTimeController = function($location, ClusterService, ServerService, UtilService, $log, $timeout, RequestService) {
            var self = this;
            this.discoveredHosts = [];
            ClusterService.getList().then(function(clusters) {
                if(clusters.length > 0) {
                }
            });

            this.createCluster = function() {
                $location.path('/clusters/new');
            };

            this.importCluster = function() {
                $location.path('/clusters/import');
            };

            ServerService.getDiscoveredHosts().then(function(freeHosts) {
               _.each(freeHosts, function(freeHost) {
                var host = {
                    hostname: freeHost.node_name,
                    ipaddress: freeHost.management_ip,
                    state: "UNACCEPTED",
                    selected: false
                };
                self.discoveredHosts.push(host);
               });
            });
           
            this.acceptHost = function(host) {
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
                                $log.info('Failed to accept host in first controller' + host.hostname);
                                host.state = "FAILED";
                                host.task = undefined;
                            }
                            else if (request.status === 'SUCCESS'){
                                $log.info('Accepted host in first controller ' + host.hostname);
                                host.state = "ACCEPTED";
                                host.task = undefined;
                            }
                            else {
                                $log.info('Accepting host in first controller' + host.hostname);
                                $timeout(callback, 5000);
                            }
                        });
                    }
                    $timeout(callback, 5000);
                });
            };

            this.acceptAllHosts = function() {
                _.each(self.discoveredHosts, function(host) {
                    if(host.state === "UNACCEPTED") {
                        self.acceptHost(host);
                    }
                });
            };
        };
        return ['$location', 'ClusterService', 'ServerService', 'UtilService', '$log', '$timeout', 'RequestService', FirstTimeController];
    });
})();
