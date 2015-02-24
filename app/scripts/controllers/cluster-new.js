/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var ClusterNewController = function($scope, $location) {
        this.step = 1;

            this.moveStep = function(nextStep) {
                this.step = this.step + nextStep;
                if(this.step < 1) {
                    this.cancel();
                }
            }

            this.cancel = function() {
                $location.path('/clusters');
            };

            this.save    = function() {
                $location.path('/clusters');
            };
        };
        return ['$scope', '$location', ClusterNewController];
    });
})();