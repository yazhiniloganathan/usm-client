/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var ClusterNewController = function($scope, $location) {
            $scope.cancel = function() {
                $location.path('/clusters');
            };
            $scope.save	 = function() {
            	$location.path('/clusters');	
            };
        };
        return ['$scope', '$location', ClusterNewController];
    });
})();