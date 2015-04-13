/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var VolumeNewController = function($scope, $log, $location, ClusterService, RequestTrackingService) {
            this.step = 1;
            var self = this;       

            this.moveStep = function(nextStep) {
                this.step = this.step + nextStep;
            };

            this.isCancelAvailable = function() {
                return this.step === 1;
            };

            this.isSubmitAvailable = function() {
                return this.step === 4;
            };

            this.cancel = function() {
                $location.path('/clusters');
            };

            this.submit = function() {
            };
        };
        return ['$scope', '$log', '$location', 'ClusterService', 'RequestTrackingService', VolumeNewController];
    });
})();
