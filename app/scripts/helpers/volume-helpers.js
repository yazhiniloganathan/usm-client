/*global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {
        var volumeTypes = [
            { id:1, type:'Distribute'},
            { id:2, type:'Distributed Replicate'},
            { id:3, type:'Replicate'}
        ];

        var volumeStates = [
            { id:0, state:'Up'},
            { id:1, state:'Warning'},
            { id:2, state:'Down'},
            { id:3, state:'Unknown'},
            { id:4, state:'Created'}
        ];

        var volumeCopiesList = [2, 3, 4];
        var copyCountRecomended = 3;

        var targetSizeUnits = [
            { id:1, unit: 'GB' },
            { id:2, unit: 'TB' }
        ];

        var findPairDisks = function(diskPool) {
            var pairDisks = [];
            _.each(devicesList, function(devices) {
                _.each(devices, function(localdevice) {
                    if(device.node !== localdevice.node) {
                        pairDisks
                    }
                });
            });
            return pairDisks;
        };

        var getDiskPool = function(diskPools, size) {
            return _.find(diskPools, function(diskPool) {
                return diskPool.size === size;
            });
        };

        var getStorageDervicesForVolume = function(targetSize, copyCount, devicesList) {
            var selectedDevices = [];
            var diskPools = [];
            var diskPairs = {};
            _.each(devicesList, function(devices) {
                _.each(devices, function(device) {
                    var sizeRounded = Math.round(device.size);
                    var diskPool = getDiskPool(sizeRounded);
                    if(diskPool) {
                        diskPool.devices.push(device);
                    }
                    else {
                        diskPool = { size: sizeRounded, devices: [device] };
                        diskPools.push(diskPool);
                    }
                });
            });

            _.each(diskPools, function(diskPool) {
                _.each(diskPool.devices, function(device) {

                });
            });

            return selectedDevices;
        };

        var getStorageDervicesForVolumeBasic = function(targetSize, copyCount, devicesList) {
            var selectedDevices = [];
            var size = 0;
            var iter = 0;
            while(size < targetSize) {
                var subVolSize = 0;
                _.each(_.range(copyCount), function(copyNo) {
                    var device = devicesList[copyNo][iter];
                    if(subVolSize === 0) {
                        device.repStart = true;
                    }
                    else {
                        device.repStart = false;
                    }
                    device.repSet = iter;
                    subVolSize = device.size > subVolSize ? device.size : subVolSize;
                    selectedDevices.push(device);
                });
                iter++;
                size = size + subVolSize;
            }

            return selectedDevices;
        };

        var getVolumeSize = function(devices, copyCount) {
            var volumeSize = 0;
            for(var subVol=0; subVol<devices.length/copyCount; subVol++) {
                var subVolSize = 0;
                _.each(_.range(copyCount), function(copyNo){
                    var device = devices[ subVol * copyCount + copyNo];
                    subVolSize = device.size > subVolSize ? device.size : subVolSize;
                });
                volumeSize = volumeSize + subVolSize;
            }
            return volumeSize;
        };

        return {
            getVolumeType: function(id) {
                return _.find(volumeTypes, function(type) {
                    return type.id === id;
                });
            },
            getVolumeState: function(id) {
                return _.find(volumeStates, function(state) {
                    return state.id === id;
                });
            },
            getCopiesList: function() {
                return volumeCopiesList;
            },
            getRecomenedCopyCount: function() {
                return copyCountRecomended;
            },
            getTargetSizeUnits: function() {
                return targetSizeUnits;
            },
            getStorageDervicesForVolumeBasic: getStorageDervicesForVolumeBasic,
            getVolumeSize: getVolumeSize
        };
    });
})();
