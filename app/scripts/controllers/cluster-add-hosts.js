/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {
        var ClusterAddHostsController = function($scope) {
            console.log("I am here");
            this.onAddHost();
        };
        return ['$scope', ClusterAddHostsController];
    });
})();