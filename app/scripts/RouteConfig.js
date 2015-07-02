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
                templateUrl: 'views/login.html',
                menuId: 'login',
                controller: 'LoginController',
            }).when('/dashboard', {
                templateUrl: 'views/dashboard.html',
                menuId: 'dashboard',
                controller: 'DashboardController',
                controllerAs: 'dash'
            }).when('/first', {
                templateUrl: 'views/first.html',
                menuId: '',
                controller: 'FirstTimeController',
                controllerAs: 'first'
            }).when('/clusters', {
                templateUrl: 'views/clusters.html',
                menuId: 'clusters',
                controller: 'ClusterController',
            }).when('/clusters/new', {
                templateUrl: 'views/clusters-new.html',
                menuId: 'clusters',
                controller: 'ClusterNewController',
                controllerAs: 'cluster'
            }).when('/clusters/expand/:id', {
                templateUrl: 'views/clusters-expand.html',
                menuId: 'clusters',
                controller: 'ClusterExpandController',
                controllerAs: 'cluster'
            }).when('/clusters/detail/:id', {
                templateUrl: 'views/clusters-detail.html',
                menuId: '',
                controller: 'ClusterDetailController',
                controllerAs: 'clusterdetail'
            }).when('/hosts', {
                templateUrl: 'views/hosts.html',
                menuId: 'hosts',
                controller: 'HostController',
                controllerAs: 'hosts'
            }).when('/volumes', {
                templateUrl: 'views/volumes.html',
                menuId: 'storage',
                controller: 'VolumeController',
                controllerAs: 'volumes'
            }).when('/volumes/new', {
                templateUrl: 'views/volumes-new.html',
                menuId: 'storage',
                controller: 'VolumeNewController',
                controllerAs: 'volume'
            }).when('/volumes/expand/:id', {
                templateUrl: 'views/volumes-expand.html',
                menuId: 'storage',
                controller: 'VolumeExpandController',
                controllerAs: 'volume'
            }).when('/pools', {
                templateUrl: 'views/pools.html',
                menuId: 'storage',
                controller: 'PoolController',
                controllerAs: 'pools'
            }).when('/pools/new', {
                templateUrl: 'views/pools-new.html',
                menuId: 'storage',
                controller: 'PoolNewController',
                controllerAs: 'pool'
            }).when('/pools/edit/:id', {
                templateUrl: 'views/pools-edit.html',
                menuId: 'storage',
                controller: 'PoolEditController',
                controllerAs: 'pool'
            }).otherwise({
                redirectTo: '/'
            });
        };
        return ['$routeProvider', RouteConfig];
    });
})();
