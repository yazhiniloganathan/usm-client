/*global require */
(function() {
    'use strict';
    require.config({
        shim: {
            'angular-resource': {
                deps: ['angular']
            },
            'angular-cookies': {
                deps: ['angular']
            },
            'angular-sanitize': {
                deps: ['angular']
            },
            'angular-route': {
                deps: ['angular']
            },
            'angular-strap': {
                deps: ['angular', 'angular-animate']
            },
            'angular-strap-tpl': {
                deps: ['angular-strap']
            },
            'angular-animate': {
                deps: ['angular']
            },
            'restangular': {
                deps: ['angular', 'lodash']
            },
            //'bootstrap': {
            //    deps: ['jquery']
            //},
            'patternfly': {
                deps: ['jquery']
            },
            'angular-patternfly': {
                deps: ['angular']
            },
            'angular': {
                deps: ['jquery'],
                exports: 'angular'
            }
        },
        paths: {
            'jquery': '../bower_components/jquery/dist/jquery',
            'angular': '../bower_components/angular/angular',
            'angular-resource': '../bower_components/angular-resource/angular-resource',
            'angular-cookies': '../bower_components/angular-cookies/angular-cookies',
            'angular-sanitize': '../bower_components/angular-sanitize/angular-sanitize',
            'angular-route': '../bower_components/angular-route/angular-route',
            'patternfly': '../bower_components/patternfly/dist/js/patternfly',
            'angular-patternfly': '../bower_components/angular-patternfly/dist/angular-patternfly',
            'angular-strap': '../bower_components/angular-strap/dist/angular-strap.min',
            'angular-strap-tpl': '../bower_components/angular-strap/dist/angular-strap.tpl.min',
            'angular-animate': '../bower_components/angular-animate/angular-animate',
            'restangular': '../bower_components/restangular/dist/restangular',
            'lodash': '../bower_components/lodash/dist/lodash',
            'moment': '../bower_components/momentjs/moment',
            'idbwrapper': '../bower_components/idbwrapper/idbstore'
        }
    });

    require(['./app'], function() {});
})();
