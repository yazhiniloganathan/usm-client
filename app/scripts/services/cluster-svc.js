/*global define*/
define(['lodash'], function(_) {
    'use strict';

    // Cluster Service is a service which is injected into other services.
    // We do this so we have only one service tracking the active cluster
    // FSID, simplifying updates across the app.
    //
    // This service is slightly different because it has an initialize
    // method, which is a simple bootstrap that requests the current list
    // of Cluster FSIDs known about and picks the very first one returned.
    //
    // In the future this will have to be a guided, by either the User's
    // profile and/or saved defaults.
    //
    // ###A typical usage pattern
    // ```
    // ClusterService.getList().then(function(clusters) {
    //     ...do something with clusters result array...
    // });
    // ```
    //
    // All service methods should return $q style promises.
    // @see https://docs.angularjs.org/api/ng/service/$q
    //
    var ClusterService = function(Restangular, $q, $location, ServerService, ErrorService) {
        // This custom response extractor handles the paginated response
        // from our Calamari Django JSON API.
        var djangoPaginationResponseExtractor = function(response /*, operation, what, url */ ) {
            if (response.count !== undefined && response.results !== undefined) {
                var newResponse = response.results;
                // Add a new object **pagination** which contains the next, previous urls and count.
                // These are currently unused.
                newResponse.pagination = {
                    next: response.next,
                    previous: response.previous,
                    count: response.count
                };
                return newResponse;
            }
            return response;
        };

        // We use Restangular to wrap $http and give us a more natural interface
        // to the Calamari JSON API that returns $q promises.
        //
        // We instantiate 2 root restangular instances with different configurations.
        // The first one is for simple JSON API requests.
        var restangular = Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/').setResponseExtractor(djangoPaginationResponseExtractor).setErrorInterceptor(ErrorService.errorInterceptor);
        });
        // The second gives us access to the raw response so we can look at the status code.
        // Useful for APIs that return 202 responses for asynchronous tasks.
        var restangularFull = Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/').setFullResponse(true).setResponseExtractor(djangoPaginationResponseExtractor).setErrorInterceptor(ErrorService.errorInterceptor);
        });
        // **constructor**
        var Service = function() {
            this.restangular = restangular;
            this.restangularFull = restangularFull;
        };
        Service.prototype = _.extend(Service.prototype, {
            // **initialize**
            // This must be run before any other service to
            // initialize the cluster model and fsid values.
            // **@returns** a promise so you can wait for it to be complete.
            initialize: function() {
                var self = this;
                return this.getList().then(function(clusters) {
                    if (clusters.length) {
                        var cluster = _.first(clusters);
                        self.clusterId = cluster.id;
                        self.clusterModel = cluster;
                        return;
                    }
                    self.clusterId = null;
                    self.clusterModel = null;
                    $location.path('/first');
                });
            },
            // **getList**
            // **@returns** a promise with a list of all the clusters Calamari knows about.
            getList: function() {
                return this.restangular.all('clusters').getList().then(function(clusters) {
                    clusters = _.sortBy(clusters, function(cluster){
                        return cluster.cluster_name;
                    });
                    return clusters;
                });
            },
            // **get**
            // **@returns** a promise with the cluster metadata for the specific
            // cluster based on it's id.
            get: function(id) {
                return this.restangular.one('clusters', id).get().then(function(cluster) {
                    return cluster;
                });
            },
            // **getByName**
            // **@returns** a promise with the cluster metadata for the specific
            // cluster based on it's id.
            getByName: function(name) {
                return this.getList().then(function(clusters) {
                    return _.find(clusters, function(cluster) {
                        return cluster.cluster_name === name;
                    });
                });
            },
            // **getCapacity**
            // **@returns** a promise with the cluster capacity for the specific
            // cluster based on it's id.
            getCapacity: function(id) {
                return ServerService.getListByCluster(id).then(function(servers) {
                    var requests = [];
                    _.each(servers, function(server) {
                        requests.push(ServerService.getDiskStorageDevices(server.node_id));
                    });
                    return $q.all(requests).then(function(devicesList) {
                        var capacity = 0;
                        _.each(devicesList, function(devices) {
                            var size = _.reduce(devices, function(size, device) {
                                return device.size + size;
                            }, 0);
                            capacity = capacity + size;
                        });
                        return capacity;
                    });
                });
            },

            // **cluster**
            // A base function that defines the root of all cluster specific
            // API requests.  It's designed to be called by other services.
            // ####e.g.
            // ```
            //     return restangular.cluster().all('servers');
            // ```
            //
            // This is how we can re-use this service without other
            // services having to be aware of the cluster FSID.
            //
            cluster: function(id) {
                if (id === undefined) {
                    id = this.clusterId;
                }
                return this.restangular.one('cluster', id);
            },
            // **clusterFull**
            // A base function that defines the root of all cluster
            // specific API request.
            // It's designed to be called by other methods.
            // Responses are raw and contain extra fields such as
            // status code.
            clusterFull: function(id) {
                if (id === undefined) {
                    id = this.clusterId;
                }
                return this.restangularFull.one('cluster', id);
            },
            // **create**
            // **@param** cluster - Information about the cluster and list of hosts.
            // **@returns** a promise which returns a request id to track the task.
            create: function(cluster) {
                return this.restangularFull.all('clusters').post(cluster);
            },
            // **remove**
            // **@param** id - id of cluster you wish to remove.
            // This is a **destructive** operation and will remove
            // any data on this cluster.
            // **@returns** a promise with the request id for the operation.
            remove: function(id) {
                return this.restangular.one('clusters', id).remove();
            },
            // **switchCluster**
            // This will be invoked when the user switches the cluster
            // using the cluster dropdown in the top of the page
            switchCluster: function(cluster){
                this.clusterModel = cluster;
                this.clusterId = cluster.id;
            },
            // **base**
            // Return the raw restangular reference.
            base: function() {
                return this.restangular;
            }
        });
        var service = new Service();
        return service;
    };
    return ['Restangular', '$q', '$location', 'ServerService', 'ErrorService', ClusterService];
});
