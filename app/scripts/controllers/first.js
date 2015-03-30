/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/modal-helpers'], function(_) {

        var FirstTimeController = function($location, ClusterService) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length > 0) {
                    $location.path('/');
                }
            });

            this.createCluster = function() {
                $location.path('/clusters/new');
            };

            this.importCluster = function() {
                $location.path('/clusters/import');
            };
        };
        return ['$location', 'ClusterService', FirstTimeController];
    });
})();
