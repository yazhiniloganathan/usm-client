/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/cluster-helpers'], function(_, ClusterHelpers) {

        var HostController = function($scope, $http) {
            var self = this;
            this.list = [];
            $http.get('http://10.70.42.87:8000/api/v1/hosts').
              success(function (data, status, headers, config) {
                self.list = data;
              }).
              error(function (data, status, headers, config) {
                console.log(status);
              });
        };
        return ['$scope', '$http', HostController];
    });
})();