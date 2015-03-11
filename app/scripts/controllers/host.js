/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var HostController = function(ServerService) {
            var self = this;
            this.list = [];
            ServerService.getList().then(function(result) {
                self.list = result;
            });

            this.remove = function() {
                _.each(this.list, function(host) {
                    if(host.selected) {
                        ServerService.remove(host.node_id).then(function(result){
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
        return ['ServerService', HostController];
    });
})();