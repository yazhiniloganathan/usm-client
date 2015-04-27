/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {
        var RequestsController = function($scope, $interval, RequestTrackingService) {
            $scope.tasks = [];

            $scope.reloadTasks = function() {
                RequestTrackingService.getTrackedRequests().then(function(tasks) {
                    $scope.tasks = tasks;
                });
            }

            var timer = $interval($scope.reloadTasks, 5000);
        };
        return ['$scope', '$interval', 'RequestTrackingService', RequestsController];
    });
})();
