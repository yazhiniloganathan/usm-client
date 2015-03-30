/* global define */
define(['lodash', 'idbwrapper'], function(_, IDBStore) {
    'use strict';
    /* Bind this service as soon as App is running
     */
    var id = 0;
    var timer = 5000;
    var requestTrackingService = function($q, $log, $timeout, RequestService, growl) {
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
                    self.timeout = $timeout(self.processRequests, timer);
                },
                onError: function() {
                    $log.error('Unable to create UserRequest store');
                }
            });
            _.bindAll(this, 'add', 'remove', 'getTrackedRequests', 'getLength', 'processRequests');
        }
        Service.prototype = _.extend(Service.prototype, {
            add: function(id, operation) {
                var d = $q.defer();
                if (id === null || id === undefined) {
                    // resolve empty ids immediately
                    d.resolve();
                } 
                else {
                    this.requests.put({
                        id: id,
                        operation: operation,
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
                var self = this;
                $log.debug('Refreshing the requests in the store');
                self.getTrackedRequests().then(function(requests) {
                    _.each(requests, function(trackedRequest) {
                        RequestService.get(trackedRequest.id).then(function (request){
                            if (request.status === 'FAILED') {
                                self.showError(trackedRequest.operation + ' is failed');
                                $log.info(trackedRequest.operation + ' is failed');
                                self.remove(trackedRequest.id);
                            }
                            else if (request.status === 'SUCCESS'){
                                self.showNotification(trackedRequest.operation + ' is completed sucessfully');
                                $log.info(trackedRequest.operation + ' is completed sucessfully');
                                self.remove(trackedRequest.id);   
                            }
                            else if (request.status === 'STARTED'){
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
                self.timeout = $timeout(self.processRequests, timer);
            },
            showError: function(msg) {
                // TODO: too tightly coupled use $broadcast
                growl.error('ERROR: ' + msg, {
                    ttl: -1
                });
            },
            showNotification: function(msg) {
                // TODO: too tightly coupled use $broadcast
                growl.success(msg);
            }
        });
        return new Service();
    };

    var service = null;
    return function RequestTrackingServiceProvider() {
        // This is an app wide singleton
        this.$get = ['$q', '$log', '$timeout', 'RequestService', 'growl',
            function($q, $log, $timeout, RequestService, growl){
                if(service == null) {
                    service = requestTrackingService($q, $log, $timeout, RequestService, growl);
                }
                return service;
            }
        ];
    }
});
