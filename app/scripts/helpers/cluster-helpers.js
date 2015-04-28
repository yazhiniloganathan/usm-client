/*global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var storageTypes = [
            { id:1, type:'Block' },
            { id:2, type:'File' },
            { id:3, type:'Object' }
        ];

        var clusterTypes = [
            {
                id:1,
                type:'Gluster',
                deploymentTypes: [
                    { id:1, type:'Demo (2 hosts)', nodeCount:2 },
                    { id:2, type:'Minimum (3 hosts)', nodeCount:3 },
                    { id:3, type:'Standard (6 hosts)', nodeCount:6 }
                ]
            },
            {
                id:2,
                type:'Ceph',
                deploymentTypes: [
                    { id:1, type:'Demo (2 hosts)', nodeCount:2 },
                    { id:2, type:'Minimum (3 hosts)', nodeCount:3 },
                    { id:3, type:'Standard (10 hosts)', nodeCount:10 }
                ]
            }
        ];

        var clusterStates = [
            { id:1, state:'Inactive'},
            { id:2, state:'Not Available'},
            { id:3, state:'Active'},
            { id:4, state:'Creating'},
            { id:5, state:'Failed'}
        ];

        return {
            getClusterTypes: function() {
                return clusterTypes;
            },
            getClusterType: function(id){
                return _.find(clusterTypes, function(type) {
                    return type.id === id;
                });
            },
            getStorageTypes: function() {
                return storageTypes;
            },
            getStorageType: function(id) {
                return _.find(storageTypes, function(type) {
                    return type.id === id;
                });
            },
            getClusterStatus: function(id) {
                return _.find(clusterStates, function(type) {
                    return type.id === id;
                });
            }
        };
    });
})();
