/* global define */
(function() {
    'use strict';
    define(['lodash', 'angular', 'RouteConfig', 'controllers/menu', 'controllers/dashboard', 'controllers/cluster', 'controllers/cluster-new', 'services/menu-svc', 'angular-cookies', 'angular-resource', 'angular-sanitize', 'angular-route', 'angular-strap', 'angular-strap-tpl', 'angular-animate', 'patternfly', 'angular-patternfly'], function(_, angular, RouteConfig, MenuController, DashboardController, ClusterController, ClusterNewController, MenuService) {

        var app = angular.module('usmClientApp', [
             //   'ngAnimate',
                'ngCookies',
                'ngResource',
                'ngSanitize',
                'ngRoute',
                'mgcrea.ngStrap'
        ])
        // Controllers are responsible for initial view state.
        // Controllers themselves are meant to be stateless and are
        // designed to re-store the view state every time they are
        // loaded. Treat them as if they are loaded once on page
        // initialization and then not used again.       
            .controller('MenuController', MenuController)
            .controller('DashboardController', DashboardController)
            .controller('ClusterController', ClusterController)
            .controller('ClusterNewController', ClusterNewController)
        // Services are where a module can store state. They are loaded
        // once at start up and because they're shared module wide, they can
        // be used to maintain state between controllers.
            .service('MenuService', MenuService)
        // Run blocks are run once at module startup.
        // This is an ideal place to exec one time tasks.
            .run(function(){})
        // Service Providers may be individually configured by modules.
            .config(['$logProvider',
            function($logProvider) {
                $logProvider.debugEnabled(false);
            }
        ]).config(RouteConfig);

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
