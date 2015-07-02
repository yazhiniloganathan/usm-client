/* global define */
(function() {
    'use strict';

    define(['lodash', 'angular', 'RouteConfig', 'ApiModule', 'components/requests/requestsModule', 'controllers/menu', 'controllers/login', 'controllers/dashboard', 'controllers/first', 'controllers/cluster', 'controllers/cluster-new', 'controllers/cluster-expand',  'controllers/cluster-detail','controllers/host', 'controllers/volume', 'controllers/volume-new', 'controllers/volume-expand', 'controllers/pool', 'controllers/pool-new', 'controllers/pool-edit', 'services/menu-svc', 'services/configuration', 'services/error', 'angular-cookies', 'angular-resource', 'angular-sanitize', 'angular-route', 'angular-strap', 'angular-strap-tpl', 'angular-animate', 'patternfly', 'angular-patternfly', 'restangular', 'angular-growl', 'd3', 'c3', 'c3-angular', 'ng-autofocus'], function(_, angular, RouteConfig, APIModule, RequestModule, MenuController, LoginController, DashboardController, FirstTimeController, ClusterController, ClusterNewController,ClusterExpandController, ClusterDetailController, HostController, VolumeController, VolumeNewController, VolumeExpandController, PoolController, PoolNewController, PoolEditController, MenuService, ConfigurationService, ErrorService) {

        var app = angular.module('usmClientApp', [
               'ngAnimate',
                APIModule,
                RequestModule,
                'ngCookies',
                'ngResource',
                'ngSanitize',
                'ngRoute',
                'mgcrea.ngStrap',
                'gridshore.c3js.chart',
                'autofocus'
        ])
        // Controllers are responsible for initial view state.
        // Controllers themselves are meant to be stateless and are
        // designed to re-store the view state every time they are
        // loaded. Treat them as if they are loaded once on page
        // initialization and then not used again.       
            .controller('MenuController', MenuController)
            .controller('LoginController', LoginController)
            .controller('DashboardController', DashboardController)
            .controller('FirstTimeController', FirstTimeController)
            .controller('ClusterController', ClusterController)
            .controller('ClusterNewController', ClusterNewController)
            .controller('ClusterExpandController', ClusterExpandController)
            .controller('ClusterDetailController', ClusterDetailController)
            .controller('HostController', HostController)
            .controller('VolumeController', VolumeController)
            .controller('VolumeNewController', VolumeNewController)
            .controller('VolumeExpandController', VolumeExpandController)
            .controller('PoolController', PoolController)
            .controller('PoolNewController', PoolNewController)
            .controller('PoolEditController', PoolEditController)
        // Services are where a module can store state. They are loaded
        // once at start up and because they're shared module wide, they can
        // be used to maintain state between controllers.
            .service('MenuService', MenuService)
            .service('ConfigurationService', ConfigurationService)
            .service('ErrorService', ErrorService)
        // Run blocks are run once at module startup.
        // This is an ideal place to exec one time tasks.
            .run( function($rootScope, $location) {
               $rootScope.$watch(function() {
                  return $location.path();
                },
                function(a){
                  console.log('url has changed: ' + a);
                  $rootScope.currentURI = a;
                  // show loading div, etc...
                });
            })
        // Service Providers may be individually configured by modules.
            .config(['$logProvider',
                function($logProvider) {
                    $logProvider.debugEnabled(true);
                }
            ])
            .config(RouteConfig)
            .config(['$httpProvider', function($httpProvider){
                $httpProvider.defaults.xsrfCookieName = 'csrftoken';
                $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
            }]);

        console.log(app);

        // We don't use ngapp markup to tell Angular what part of the
        // DOM to run the module against, instead we manually
        // bootstrap it by passing it the element and module.
        //
        // This lets us control the start up order and defer
        // startup till require has loaded all the dependencies.
        angular.element(document).ready(function() {
            _.each([{
                    clazz: 'usmClientApp',
                    module: ['usmClientApp']
                }
            ], function(selector) {
                try {
                    angular.bootstrap(document.getElementsByClassName(selector.clazz)[0], selector.module);
                } catch (e) {
                    console.error('Failed to init ' + selector.module, e);
                }
            });
        });
    });
})();
