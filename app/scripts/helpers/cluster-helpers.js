/*global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {

        var clusterTypes = [
            { id:1, type:'Gluster' },
            { id:2, type:'Ceph' }
        ];

        var storageTypes = [
            { id:1, type:'Block Storage' },
            { id:2, type:'File Storage' },
            { id:3, type:'Object Storage' }
        ];

        var clusterStates = [
            { id:1, state:'Active' },
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
