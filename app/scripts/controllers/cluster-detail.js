(function() {
    'use strict;'
    define(['lodash', 'helpers/mock-data-provider-helpers', 'c3'], function(_, MockDataProviderHelpers, c3) {
        window.c3 = c3;
        var ClusterDetailController = function($scope, $location, $log, $routeParams, ClusterService) {
            var self = this;
            //
            this.cluster = {};
            this.mockCluster = {};
            var mockCluster = MockDataProviderHelpers.getMockCluster('second_cluster');
            this.mockCluster = mockCluster;
            this.cluster.name = ClusterService.get($routeParams.id)
                .cluster_name;
            //
            this.cluster.types = [
                {  id: 1,  name: 'Used',  color: '#4AD170', type: 'donut'},
                {  id: 9,  name: 'Free',  color: '#CCCCCC', type: 'donut'}
            ];
            this.cluster.usages = [
                { '1': this.mockCluster.utilization.used },
                { '9': this.mockCluster.utilization.total - this.mockCluster.utilization.used }
            ];
            this.cluster.utilizationTrends = {};
            this.cluster.utilizationTrends.cols = [
                {
                    id: 1,
                    name: 'Used',
                    color: '#39a5dc',
                    type: 'area-spline'
                }
            ];
            this.cluster.iopsTrends = {};
            this.cluster.iopsTrends.cols = [
                {
                    id: 1,
                    name: 'Using',
                    color: '#39a5dc',
                    type: 'area-spline'
                }
            ];
            
            this.getRandomList = function(key, count, min, max) {
                var list = [];
                _.each(_.range(count), function(index) {
                    var value = {};
                    value[key] = _.random(min, max);
                    list.push(value);
                });
                return list;
            };
            this.cluster.iopsTrends.values = this.getRandomList('1', 50, 60, 65);
            this.cluster.utilizationTrends.values = this.getRandomList('1', 50, 60, 65);
            this.getStatusColor = function(value) {
                if (value >= 90) return '#E35C5C';
                if (value >= 80) return '#FF8C1B';
                else return '#4AD170';
            };
            this.getHeatLevel = function(usage) {
                if (usage > 90) {
                    return 'heat-l0';
                } else if (usage > 80) {
                    return 'heat-l1';
                } else if (usage > 70) {
                    return 'heat-l2';
                } else {
                    return 'heat-l3';
                }
            };
        }
        return ['$scope', '$location', '$log', '$routeParams', 'ClusterService', ClusterDetailController];
    });
})();