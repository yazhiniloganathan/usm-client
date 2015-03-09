/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var HostController = function(ServerService) {
            var self = this;
            this.list = [];
            ServerService.getList().then(function(result) {
              self.list = data;
            });
        };
        return ['ServerService', HostController];
    });
})();