/*global define*/
define(['lodash'], function(_) {
    'use strict';
    // Wraps the **/api/v1/ceph/pools** API.
    var PoolService = function(Restangular, ErrorService) {
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
            // **@returns** a promise with all pools.
            getList: function() {
                return this.restangular.all('pools').getList().then(function(osds) {
                    return osds;
                });
            },
            // **getListByCluster
            // **@returns** a promise with all pools of the cluster.
            getListByCluster: function(clusterId) {
                return this.restangular.all('pools').getList().then(function(pools) {
                    return _.filter(pools, function(pool) {
                        return pool.cluster === clusterId;
                    });
                });
            },
            // **get**
            // **@returns** a promise with pool metadata.
            get: function(id) {
                return this.restangular.one('pools', id).get().then(function(pool) {
                    return pool;
                });
            },
            // **create**
            // **@param** osds - Information about the list of pools.
            // **@returns** a promise which returns a request id to track the task.
            create: function(pools) {
                return this.restangularFull.all('pools').post(pools);
            }
        });
        return new Service();
    };
    return ['Restangular', 'ErrorService', PoolService];
});
