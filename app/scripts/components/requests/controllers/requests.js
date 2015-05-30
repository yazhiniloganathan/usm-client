/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {
        var RequestsController = function($scope, $interval, UserService, RequestTrackingService, ServerService, UtilService, RequestService, $log, $timeout) {
            $scope.tasks = [];
            $scope.discoveredHostsLength = 0;
            $scope.discoveredHosts = [];

            $scope.reloadTasks = function() {
                RequestTrackingService.getTrackedRequests().then(function(tasks) {
                    $scope.tasks = tasks;
                });
            }
            $scope.reloadDiscoveredHostsLength = function() {
                ServerService.getDiscoveredHosts().then(function(freeHosts) {
                  $scope.discoveredHostsLength = freeHosts.length;
                });
            }

            $scope.logoutUser = function()   {
               UserService.logout().then(function(logout)  {
                    document.location = '';
                });
            }

            $scope.getDiscoveredHosts = function() {

                $scope.discoveredHosts = _.filter($scope.discoveredHosts, function(host)    {
                    return host.state !== "ACCEPTED";
                });

                ServerService.getDiscoveredHosts().then(function(freeHosts) {
                   _.each(freeHosts, function(freeHost) {
                        var host = {
                            hostname: freeHost.node_name,
                            ipaddress: freeHost.management_ip,
                            state: "UNACCEPTED",
                            selected: false
                        };

                        var isPresent = false;

                        isPresent = _.some($scope.discoveredHosts, function(dHost)  {
                            return dHost.hostname === host.hostname;
                        });

                        if(!isPresent)  {
                            $scope.discoveredHosts.push(host);
                        }
                   });
                });
            }

            $scope.getAlert=function() {
                 $scope.alerts=["Notification1","Notification2","Notification3","Notification4"];
                 return alerts;
            }

            $scope.acceptHost = function(host) {
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
                                $log.info('Failed to accept host in requests controller' + host.hostname);
                                host.state = "FAILED";
                                host.task = undefined;
                            }
                            else if (request.status === 'SUCCESS'){
                                $log.info('Accepted host in requests controller ' + host.hostname);
                                host.state = "ACCEPTED";
                                host.task = undefined;
                            }
                            else {
                                $log.info('Accepting host in requests controller' + host.hostname);
                                $timeout(callback, 5000);
                            }
                        });
                    }
                    $timeout(callback, 5000);
                });
            };

            $scope.openDiscoveredHostsModel = function() {
                document.getElementById("openDiscoveredHosts").click();
            }

            $scope.acceptAllHosts = function() {
                _.each($scope.discoveredHosts, function(host) {
                    if(host.state === "UNACCEPTED") {
                        $scope.acceptHost(host);
                    }
                });
            };

            $interval($scope.reloadTasks, 5000);
            $interval($scope.reloadDiscoveredHostsLength, 5000);
        };

        return ['$scope', '$interval', 'UserService', 'RequestTrackingService', 'ServerService', 'UtilService', 'RequestService', '$log', '$timeout', RequestsController];
    });
})();
