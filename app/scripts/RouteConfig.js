/* global define */
(function() {
    'use strict';
    define([], function() {
        // We use basic angular routing, there are no
        // nested views in this application so there is
        // no current need for anything more sophisticated
        // like angular-ui-router.
        //

        var RouteConfig = function($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'views/dashboard.html',
                menuId: 'dashboard',
                controller: 'DashboardController',
            }).when('/clusters', {
                templateUrl: 'views/clusters.html',
                menuId: 'cluster',
                controller: 'ClusterController',
            }).otherwise({
                redirectTo: '/'
            });
        };
        return ['$routeProvider', RouteConfig];
    });
})();
