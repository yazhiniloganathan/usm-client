/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var ClusterNewController = function($scope, $modal, $location) {
            this.step = 1;
            var self = this;
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

            this.hosts = [];

            this.addHosts = function() {
                var modal = $modal({
                    title: 'Add Hosts',
                    template: 'views/clusters-new-hosts-add.html'
                });
                modal.$scope.hostToAdd = {};
                modal.$scope.hostsToAdd = [];
                modal.$scope.onAddHost = function() {
                    modal.$scope.hostsToAdd.push(modal.$scope.hostToAdd);
                    var password = modal.$scope.hostToAdd.password;
                    modal.$scope.hostToAdd = {};
                    if(modal.$scope.rememberPassword) {
                        modal.$scope.hostToAdd.password = password;
                    }
                }

                modal.$scope.onAddHosts = function() {
                    self.onAddHosts(modal.$scope.hostsToAdd);
                }
            };

            this.onAddHosts = function(hosts) {
                self.hosts = hosts;
            }

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
                $location.path('/clusters');
            };
        };
        return ['$scope', '$modal', '$location', ClusterNewController];
    });
})();