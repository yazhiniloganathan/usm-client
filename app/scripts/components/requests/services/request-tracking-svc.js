/* global define */
define(['lodash', 'idbwrapper'], function(_, IDBStore) {
    'use strict';
    /* Bind this service as soon as App is running
     */
    var id = 0;
    var requestTrackingService = function($q, $log, $timeout, RequestService) {
        var Service = function() {
            this.id = id++;
            $log.debug('Creating Request Tracking Service [' + this.id + ']');
            var self = this;
            this.requests = new IDBStore({
                dbVersion: 1,
                storeName: 'UserRequest',
                keyPath: 'id',
                autoIncrement: false,
                onStoreReady: function(){
                    $log.info('UserRequest store is ready!');
                },
                onError: function() {
                    $log.error('Unable to create UserRequest store');
                }
            });
        }
        Service.prototype = _.extend(Service.prototype, {
            add: function(id, entityType) {
                var d = $q.defer();
                if (id === null || id === undefined) {
                    // resolve empty ids immediately
                    d.resolve();
                } 
                else {
                    this.requests.put({
                        id: id,
                        entityType: entityType,
                        timestamp: Date.now()
                    }, function(id) {
                        $log.info('Tracking new request '+id);
                        d.resolve(id);
                    }, function(error) {
                        $log.error('Error inserting request ' + id + ' error: ' + error);
                        d.reject(id, error);
                    });
                }
                return d.promise;
            },
            remove: function(id) {
                var d = $q.defer();
                this.requests.remove(id, d.resolve, d.reject);
                d.promise.then(function() {
                    $log.info('Removed request id ' + id);
                }, function(error) {
                    $log.error('Error in removing request id ' + id);
                });
                return d.promise;
            },
            getTrackedRequests: function() {
                var d = $q.defer();
                this.requests.getAll(d.resolve, d.reject);
                return d.promise;
            },
            getLength: function() {
                var d = $q.defer();
                this.requests.count(d.resolve, d.reject);
                return d.promise;
            },
            processRequests: function() {
                var self = this.
                this.getTrackedRequests().then(function(requests) {
                    _.each(requests, function(trackedRequest) {
                        RequestService.get(trackedRequest.id).then(function (request){
                            if (request.error) {
                                //TODO: show error popup
                                self.remove(trackedRequest.id);
                            }
                            else if (request.state === 'complete'){
                                //TODO: show sucess popup
                                $log.info('Request ' + trackedRequest.id + ' is completed');
                                self.remove(trackedRequest.id);   
                            }
                            else {
                                $log.info('Request ' + trackedRequest.id + ' is in progress');
                            }
                        }, function (resp) {
                            if (resp.status === 404) {
                                $log.warn('Request ' + trackedRequest.id + ' NOT FOUND');
                                self.remove(trackedRequest.id);
                            }
                        });
                    });
                });
            }
        });
        return new Service();
    };

    var service = null;
    return function RequestTrackingServiceProvider() {
        // This is an app wide singleton
        this.$get = ['$q', '$log', '$timeout', 'RequestService', 
            function($q, $log, $timeout, RequestService){
                if(service == null) {
                    service = requestTrackingService($q, $log, $timeout, RequestService);
                }
                return service;
            }
        ];
    }
});
