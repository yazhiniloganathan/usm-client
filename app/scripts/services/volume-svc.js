/*global define*/
define(['lodash'], function(_) {
    'use strict';
    // Wraps the **/api/v2/hosts** API.
    var VolumeService = function(Restangular, ErrorService) {
        // We instantiate 2 root restangular instances with different configurations.
        // The first one is for simple JSON API requests.
        var restangular = Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/gluster/').setErrorInterceptor(ErrorService.errorInterceptor);
        });
        // The second gives us access to the raw response so we can look at the status code.
        // Useful for APIs that return 202 responses for asynchronous tasks.
        var restangularFull = Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/gluster/').setFullResponse(true).setErrorInterceptor(ErrorService.errorInterceptor);
        });

        // **Constructor**
        var Service = function() {
            this.restangular = restangular;
            this.restangularFull = restangularFull;
        };
        Service.prototype = _.extend(Service.prototype, {

            // **getList**
            // **@returns** a promise with all volumes.
            getList: function() {
                return this.restangular.all('volumes').getList().then(function(volumes) {
                    return volumes;
                });
            },
            // **getListByCluster
            // **@returns** a promise with all volumes of the cluster.
            getListByCluster: function(clusterId) {
                return this.restangular.all('volumes').getList().then(function(volumes) {
                    return _.filter(volumes, function(volume) {
                        return volume.cluster === clusterId;
                    });
                });
            },

            // **get**
            // **@returns** a promise with volume metadata.
            get: function(id) {
                return this.restangular.one('volumes', id).get().then(function(volume) {
                    return volume;
                });
            },
            // **get**
            // **@returns** a promise with list of bricks.
            getBricks: function(id) {
                return this.restangular.one('volumes', id).all('bricks').getList().then(function(bricks) {
                    return bricks;
                });
            },
            // **getCapacity**
            // **@returns** a promise with volume capacity.
            getCapacity: function(id) {
                return this.restangular.one('volumes', id).one('utilization').get().then(function(capacity) {
                    return { total: capacity.fs_size, free: capacity.fs_free };
                });
            },
            // **create**
            // **@param** volume - Information about the volume and list of bricks.
            // **@returns** a promise which returns a request id to track the task.
            create: function(volume) {
                return this.restangularFull.all('volumes').post(volume);
            },
            // **create**
            // **@param** volume - Information about the volume and list of bricks.
            // **@returns** a promise which returns a request id to track the task.
            expand: function(volume) {
                return this.restangularFull.all('bricks').post(volume);
            },
            // **start**
            // **@param** id - Volume Identifier.
            // **@returns** a promise with status code.
            start: function(id) {
                return this.restangularFull.one('volumes', id).one('start').get();
            }
        });
        return new Service();
    };
    return ['Restangular', 'ErrorService', VolumeService];
});
