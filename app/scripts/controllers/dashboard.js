(function () {
	'use strict;'
	define(['lodash'], function(_) {
		var DashboardController = function($scope, $location, ClusterService) {
            ClusterService.getList().then(function(clusters) {
                if(clusters.length === 0) {
                    $location.path('/first');
                }
            });

            this.iopsList = [
                {
                    name: 'MyCeph1',
                    value: 354000
                },
                {
                    name: 'MyCeph2',
                    value: 297000
                },
                {
                    name: 'MyCeph3',
                    value: 123000
                },
                {
                    name: 'MyCluster1',
                    value: 96000
                },
                {
                    name: 'MyCluster2',
                    value: 92000
                }
            ];

            this.bandwidthList = [
                {
                    name: 'MyCeph1',
                    value: 35000
                },
                {
                    name: 'MyCeph2',
                    value: 27000
                },
                {
                    name: 'MyCeph3',
                    value: 13000
                },
                {
                    name: 'MyCluster1',
                    value: 9000
                },
                {
                    name: 'MyCluster2',
                    value: 2000
                }
            ];

            this.cpuList = [
                {
                    name: 'Host1',
                    value: 96
                },
                {
                    name: 'Host6',
                    value: 89
                },
                {
                    name: 'Host2',
                    value: 87
                },
                {
                    name: 'Host9',
                    value: 84
                },
                {
                    name: 'Host3',
                    value: 81
                }
            ];

            this.memoryList = [
                {
                    name: 'Host1',
                    value: 98
                },
                {
                    name: 'Host6',
                    value: 93
                },
                {
                    name: 'Host2',
                    value: 88
                },
                {
                    name: 'Host9',
                    value: 85
                },
                {
                    name: 'Host3',
                    value: 78
                }
            ];

		}
		return ['$scope', '$location', 'ClusterService', DashboardController];
	});
})();