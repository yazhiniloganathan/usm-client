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
            // **@returns** a promise with all servers discovered.
            getList: function() {
                return this.restangular.all('hosts').getList().then(function(servers) {
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
            // **getGrains**
            // **@returns** a promise with the metadata, key value pairs associated with
            // this specific server, aka grains in Salt Stack parlance.
            // **@see** http://docs.saltstack.com/en/latest/topics/targeting/grains.html
            getGrains: function(id) {
                return this.restangular.base().one('server', id).one('grains').get().then(function(server) {
                    return server;
                });
            }
        });
        return new Service();
    };
    return ['Restangular', 'ErrorService', ServerService];
});
