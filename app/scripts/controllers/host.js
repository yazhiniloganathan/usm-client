/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var HostController = function($scope, $interval, ServerService) {
            var self = this;
            this.list = [];
            this.selectAllHosts = false;

            var timer = $interval(reloadData, 5000);
            $scope.$on('$destroy', function() {
                $interval.cancel(timer);
            });
            reloadData();

            function reloadData() {
                ServerService.getList().then(function(hosts) {
                    var selectedHosts = _.filter(self.list, function(host){
                        return host.selected;
                    });
                    _.each(hosts, function(host) {
                        var selected = _.find(selectedHosts, function(selectedHost){
                            return host.node_id === selectedHost.node_id;
                        });
                        host.selected = !_.isUndefined(selected);
                    });
                    self.list = hosts;
                });
            }

            this.bulkSelectHosts = function() {
                this.selectAllHosts = !this.selectAllHosts;
                _.each(self.list, function(host){
                    host.selected = self.selectAllHosts;
                });
            }

            this.remove = function() {
                _.each(this.list, function(host) {
                    if(host.selected) {
                        ServerService.remove(host.node_id).then(function(result){
                            reloadData();
                            console.log(result);
                        });
                    }
                });
            };

            this.isDeleteAvailable = function() {
                return _.filter(this.list, function(host){
                    return host.selected;
                }).length;
            }
        };
        return ['$scope', '$interval', 'ServerService', HostController];
    });
})();