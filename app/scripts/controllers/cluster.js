/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var ClusterController = function($scope, $location) {
            $scope.create = function() {
                $location.path('/clusters/new');
            };
        };
        return ['$scope', '$location', ClusterController];
    });
})();
