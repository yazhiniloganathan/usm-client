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
                return this.restangular.all('volumes').getList().then(function(servers) {
                    return servers;
                });
            },
            // **create**
            // **@param** cluster - Information about the volume and list of bricks.
            // **@returns** a promise which returns a request id to track the task.
            create: function(cluster) {
                return this.restangularFull.all('volumes').post(cluster);
            },
        });
        return new Service();
    };
    return ['Restangular', 'ErrorService', VolumeService];
});
