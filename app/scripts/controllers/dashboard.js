(function () {
	'use strict;'
	define(['lodash'], function(_) {
		var DashboardController = function($scope, $location, ClusterService) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });
		}
		return ['$scope', '$location', 'ClusterService', DashboardController];
	});
})();