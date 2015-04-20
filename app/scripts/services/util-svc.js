/*global define*/
define(['lodash'], function(_) {
    'use strict';
    // Wraps the **/api/v2/utils** API.
    var UtilService = function(Restangular, ErrorService) {
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
            
            // **getVerify**
            // **@returns** a promise with host varification.
            getVerifyHost: function(hostObject) {
                return this.restangular.all('utils/validate-host').post(hostObject);
            },
            // **getList**
            // **@returns** a promise with ssh fingerprint.
            getSshFingerprint: function(ipAddress) {
                return this.restangular.one('utils/get_ssh_fingerprint', ipAddress).get().then(function(result) {
                    return result['ssh_key_fingerprint'];
                });
            },
            // **get**
            // **@returns** a promise with IP Address.
            getIpAddress: function(hostname) {
                return this.restangular.one('utils/resolve_hostname', hostname).get().then(function(result) {
                    if(!_.isEmpty(result['IP_Address'])) {
                        return _.first(result['IP_Address']);
                    }
                    return;
                });
            }
        });
        return new Service();
    };
    return ['Restangular', 'ErrorService', UtilService];
});
