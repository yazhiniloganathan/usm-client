/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var HostController = function($scope, $interval, ServerService) {
            var self = this;
            this.list = [];

            reloadData();

            var timer = $interval(reloadData, 5000);

            $scope.$on('$destroy', function() {
                $interval.cancel(timer);
            });

            function reloadData() {
                ServerService.getList().then(function(result) {
                    self.list = result;
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