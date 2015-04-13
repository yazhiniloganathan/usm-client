(function() {
    'use strict';
    define(['lodash'], function(_) {
        var VolumeController = function($location) {
            this.list = [];

            this.create = function() {
                $location.path('/volumes/new');
            };

            this.isDeleteAvailable = function() {
                return false;
            };
        };
        return ['$location', VolumeController]; 
    });
})();