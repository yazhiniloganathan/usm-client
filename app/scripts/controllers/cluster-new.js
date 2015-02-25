/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var ClusterNewController = function($scope, $location) {
            this.step = 1;

            this.storageTypes = [
                { type:'file', title:'File' },
                { type:'block', title:'Block' },
                { type:'object', title:'Object' }
            ];
            this.storageType = this.storageTypes[0];

            this.clusterTypes = [
                { type:'gluster', title:'Gluster' },
                { type:'ceph', title:'Ceph' }
            ];
            this.clusterType = this.clusterTypes[0];

            this.moveStep = function(nextStep) {
                this.step = this.step + nextStep;
                if(this.step < 1) {
                    this.cancel();
                }
            }

            this.isCancelAvailable = function() {
                return this.step === 1;
            }

            this.isSubmitAvailable = function() {
                return this.step === 4;
            }

            this.cancel = function() {
                $location.path('/clusters');
            };

            this.submit = function() {
                $location.path('/clusters');
            };
        };
        return ['$scope', '$location', ClusterNewController];
    });
})();