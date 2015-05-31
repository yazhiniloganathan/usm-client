/*global define*/
define(['lodash'], function(_) {
    'use strict';
    // Wraps the **/api/v2/hosts** API.
    var ServerService = function(Restangular, ErrorService) {
        // We instantiate 2 root restangular instances with different configurations.
        // The first one is for simple JSON API requests.
        var restangular = Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/').setErrorInterceptor(ErrorService.errorInterceptor);
        });
        // The second gives us access to the raw response so we can look at the status code.
        // Useful for APIs that return 202 responses for asynchronous tasks.
        var restangularFull = Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/').setFullResponse(true).setErrorInterceptor(ErrorService.errorInterceptor);
        });

        // **Constructor**
        var Service = function() {
            this.restangular = restangular;
            this.restangularFull = restangularFull;
        };
        Service.prototype = _.extend(Service.prototype, {

            // **getList**
            // **@returns** a promise with all servers.
            getList: function() {
                return this.restangular.all('hosts').getList().then(function(servers) {
                    return servers;
                });
            },
            // **getListByCluster**
            // **@returns** a promise with all servers.
            getListByCluster: function(clusterId) {
                return this.restangular.one('clusters', clusterId).all('hosts').getList().then(function(servers) {
                    return servers;
                });
            },
            // **getFreeHosts**
            // **@returns** a promise with all servers which are free.
            getFreeHosts: function() {
                return this.restangular.all('hosts').getList().then(function(servers) {
                    return _.filter(servers, function(server) {
                        return _.isNull(server.cluster);
                    });
                });
            },
            // **getDiscoveredHosts**
            // **@returns** a promise with all servers discovered.
            getDiscoveredHosts: function() {
                return this.restangular.all('discovered-hosts').getList().then(function(servers) {
                    return servers;
                });
            },
            // **get**
            // **@returns** a promise with this specific server's metadata.
            get: function(id) {
                return this.restangular.one('hosts', id).get().then(function(server) {
                    return server;
                });
            },
            // **getByHostname**
            // **@returns** a promise with this specific server's metadata.
            getByHostname: function(hostname) {
                return this.getList().then(function(servers) {
                    return _.find(servers, function(server) {
                        return server.node_name === hostname;
                    });
                });
            },
            // **add**
            // **@returns** a promise with the request id for the operation.
            add: function(host) {
                return this.restangularFull.all('hosts').post(host);
            },
            // **remove**
            // **@param** id - id of server you wish to remove.
            // **@returns** a promise with the request id for the operation.
            remove: function(id) {
                return this.restangular.one('hosts', id).remove();
            },
            // **getGrains**
            // **@returns** a promise with the metadata, key value pairs associated with
            // this specific server, aka grains in Salt Stack parlance.
            // **@see** http://docs.saltstack.com/en/latest/topics/targeting/grains.html
            getGrains: function(id) {
                return this.restangular.base().one('server', id).one('grains').get().then(function(server) {
                    return server;
                });
            },
            // **getStorageDevices**
            // **@returns** a promise with all storage devices in the server.
            getStorageDevices: function(hostId) {
                return this.restangular.one('hosts', hostId).all('storage-devices').getList().then(function(devices) {
                    return devices;
                });
            },
            // **getDiskStorageDevices**
            // **@returns** a promise with all storage devices in the server.
            getDiskStorageDevices: function(hostId) {
                return this.restangular.one('hosts', hostId).all('storage-devices').getList().then(function(devices) {
                    return _.filter(devices, function(device) {
                        return device.device_type === 'disk';
                    });
                });
            },
            // **getStorageDevicesFree**
            // **@returns** a promise with all storage devices which are not being used in the server.
            getStorageDevicesFree: function(hostId, hostname) {
                return this.getStorageDevices(hostId).then(function(devices){
                    if(hostname) {
                        _.each(devices, function(device){
                            device.hostname = hostname;
                        });
                    }
                    return _.filter(devices, function(device) {
                        return device.inuse === false && device.device_type === 'disk';
                    });
                });
            }
        });
        return new Service();
    };
    return ['Restangular', 'ErrorService', ServerService];
});
