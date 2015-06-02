/*global define */ (function() {
    'use strict';
    define(['lodash'], function(_) {

        // When cluster name will not match with any exist object , than this will be by default cluster.
        var byDefaultCluster = {
            cluster_name : "default" ,
            alerts : 0 ,
            areaSpline_values : [ { '1': 2 }, { '1': 12 }, { '1': 50 }, { '1': 60 }, { '1': 90 }] ,
            gauge_values : [{ '1': 10 }] ,
            cpu : {
                average : 45 ,
                highest : 90 ,
                lowest : 3
            },
            memory : {
                average : 81 ,
                highest : 85 ,
                lowest : 8
            },
            management_network: {
                inbound: _.random(3,10),
                outbound:_.random(13,25),
            },
            cluster_network: {
                inbound: _.random(10,20),
                outbound: _.random(25,40),
            }
        };
        // When volume name will not match with any exist object , than this will be by default volume.
        var byDefaultVolume = {
            volume_name : "default" ,
            areaSpline_values : [ { '1': 2 }, { '1': 12 }, { '1': 50 }, { '1': 60 }, { '1': 90 }] ,
            alerts : 0 
        };
        // Mock clusters with hard coded data.
        var mockClusters = [
            {
                cluster_name : "Cluster10" ,
                alerts : 0 ,
                areaSpline_values : [ { '1': 5 }, { '1': 9 }, { '1': 50 }, { '1': 80 }, { '1': 82 }] ,
                cpu : {
                    average : 28 ,
                    highest : 79 ,
                    lowest : 5
                },
                memory : {
                    average : 84 ,
                    highest : 91 ,
                    lowest : 45
                },
                management_network : {
                    inbound : 305 ,
                    outbound : 250
                },
                cluster_network : {
                    inbound : 311 ,
                    outbound : 288
                }
            },
            {
                cluster_name : "Cluster11" ,
                alerts : 1 ,
                areaSpline_values : [ { '1': 2 }, { '1': 5 }, { '1': 20 }, { '1': 30 }, { '1': 60 }] ,
                cpu : {
                    average : 85 ,
                    highest : 95 ,
                    lowest : 26
                },
                memory : {
                    average : 38 ,
                    highest : 84 ,
                    lowest : 5
                },
                management_network : {
                    inbound : 320 ,
                    outbound : 300
                },
                cluster_network : {
                    inbound : 421 ,
                    outbound : 312
                }
            }
        ];
        // Mock volumes with hard coded data.
        var mockVolumes = [
            {
                volume_name : "v1" ,
                areaSpline_values : [ { '1': 2 }, { '1': 12 }, { '1': 50 }, { '1': 60 }, { '1': 90 }] ,
                alerts : 0 
            },
            {
                volume_name : "v2" ,
                areaSpline_values : [ { '1': 4 }, { '1': 8 }, { '1': 40 }, { '1': 60 }, { '1': 60 }] ,
                alerts : 4
            }
        ];
        // **@returns** a cluster object with the cluster name for the specific
        function getMockCluster(cluster_name) {
            var tempCluster =  _.find(mockClusters, function(cluster) {
                    return cluster.cluster_name === cluster_name;
            });
            return tempCluster === undefined ? byDefaultCluster : tempCluster;
        };
        // **@returns** a volume object with the volume name for the specific
        function getMockVolume(volume_name) {
            var tempVolume =  _.find(mockVolumes, function(volume) {
                    return volume.volume_name === volume_name;
            });
            return tempVolume === undefined ? byDefaultVolume : tempVolume;
        };

        function  getRandomList(key, count, min, max, sort) {
            var list = [];
            _.each(_.range(count), function(index) {
                var value = {};
                value[key] = _.random(min, max);
                list.push(value);
            });
            return sort ? _.sortBy(list, key) : list;
        };
        return {
            getMockCluster: getMockCluster,
            getMockVolume: getMockVolume,
            getRandomList: getRandomList
        };
    });
})();
