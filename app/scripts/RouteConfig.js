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
            }).when('/first', {
                templateUrl: 'views/first.html',
                menuId: '',
                controller: 'FirstTimeController',
                controllerAs: 'first'
            }).when('/clusters', {
                templateUrl: 'views/clusters.html',
                menuId: 'cluster',
                controller: 'ClusterController',
            }).when('/clusters/new', {
                templateUrl: 'views/clusters-new.html',
                menuId: 'cluster',
                controller: 'ClusterNewController',
                controllerAs: 'cluster'
            }).when('/hosts', {
                templateUrl: 'views/hosts.html',
                menuId: 'hosts',
                controller: 'HostController',
                controllerAs: 'hosts'
            }).otherwise({
                redirectTo: '/'
            });
        };
        return ['$routeProvider', RouteConfig];
    });
})();
