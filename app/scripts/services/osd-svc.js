/*global define*/
define(['lodash'], function(_) {
    'use strict';
    // Wraps the **/api/v2/hosts** API.
    var OSDService = function(Restangular, ErrorService) {
        // We instantiate 2 root restangular instances with different configurations.
        // The first one is for simple JSON API requests.
        var restangular = Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/ceph/').setErrorInterceptor(ErrorService.errorInterceptor);
        });
        // The second gives us access to the raw response so we can look at the status code.
        // Useful for APIs that return 202 responses for asynchronous tasks.
        var restangularFull = Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/ceph/').setFullResponse(true).setErrorInterceptor(ErrorService.errorInterceptor);
        });

        // **Constructor**
        var Service = function() {
            this.restangular = restangular;
            this.restangularFull = restangularFull;
        };
        Service.prototype = _.extend(Service.prototype, {

            // **getList**
            // **@returns** a promise with all osds.
            getList: function() {
                return this.restangular.all('osds').getList().then(function(osds) {
                    return osds;
                });
            },
            // **get**
            // **@returns** a promise with osd metadata.
            get: function(id) {
                return this.restangular.one('osds', id).get().then(function(osd) {
                    return osd;
                });
            },
            // **create**
            // **@param** osds - Information about the list of osds.
            // **@returns** a promise which returns a request id to track the task.
            create: function(osds) {
                return this.restangularFull.all('osds').post(osds);
            }
        });
        return new Service();
    };
    return ['Restangular', 'ErrorService', OSDService];
});
