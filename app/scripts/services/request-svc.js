/*global define*/
define(['lodash'], function(_) {
    'use strict';
    // Default number of results in a request.
    var pageSize = 32;
    // Wraps the **/api/v1/tasks** API end-point.
    // This API is our interface in the User Request queue managed by
    // USM. When a request returns a 202 success code and a
    // request id.
    //
    // This request id is cached locally using indexdb and then we
    // periodically check the submitted queue to see if it still
    // running.
    //
    var RequestService = function(Restangular, ErrorService) {
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
            // **@returns** a promise with most recent *pageSize* requests.
            getList: function() {
                /* jshint camelcase: false */
                return this.restangular.cluster().customGETLIST('tasks', {
                    page_size: pageSize
                }).then(function(requests) {
                    return requests;
                });
            },
            // **get**
            // **@returns** a promise with a single request by it's ID.
            get: function(id) {
                return this.restangular.one('tasks', id).get().then(function(resp) {
                    return resp.data;
                });
            },
            // **getComplete**
            // **@returns** a promise with most recent *pageSize* completed requests.
            getComplete: function() {
                /* jshint camelcase: false */
                return this.restangular.cluster().customGETLIST('tasks', {
                    state: 'complete',
                    page_size: pageSize
                });
            },
            // **getComplete**
            // **@returns** a promise with most recent *pageSize* submitted requests.
            getSubmitted: function() {
                /* jshint camelcase: false */
                return this.restangular.cluster().customGETLIST('tasks', {
                    state: 'submitted',
                    page_size: pageSize
                });
            }
        });
        return new Service();
    };
    return ['Restangular', 'ErrorService', RequestService];
});
