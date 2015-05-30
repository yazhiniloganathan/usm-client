/*global define */ (function() {
    'use strict';
    define(['lodash'], function(_) {

        // When cluster name will not match with any exist object , than this will be by default cluster.
        var byDefaultCluster = {
            cluster_name : "default" ,
            description : 'default desc' ,
            data_used : 20 ,
            alerts : 0 ,
            areaSpline_values : [ { '1': 2 }, { '1': 12 }, { '1': 80 }, { '1': 20 }, { '1': 90 }] ,
            gauge_values : [{ '1': 78 }] ,
            cpu : {
                average : 45 ,
                highest : 90 ,
                lowest : 3
            },
            memory : {
                average : 34 ,
                highest : 75 ,
                lowest : 8
            },
            management_network : {
                inbound : 301 ,
                outbound : 288 
            },
            cluster_network : {
                inbound : 402 ,
                outbound : 327 
            }
        };
        // Mock clusters with hard coded data.
        var mockClusters = [
            {
                cluster_name : "second" ,
                description : 'second desc' ,
                data_used : 30 ,
                alerts : 1 ,
                areaSpline_values : [ { '1': 5 }, { '1': 9 }, { '1': 50 }, { '1': 30 }, { '1': 80 }] ,
                gauge_values : [{ '1': 53 }] ,
                cpu : {
                    average : 28 ,
                    highest : 79 ,
                    lowest : 5
                },
                memory : {
                    average : 31 ,
                    highest : 85 ,
                    lowest : 9
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
                cluster_name : "test2" ,
                description : 'test2 desc' ,
                data_used : 80 ,
                alerts : 0 ,
                areaSpline_values : [ { '1': 2 }, { '1': 5 }, { '1': 80 }, { '1': 20 }, { '1': 60 }] ,
                gauge_values : [{ '1': 86 }] ,
                cpu : {
                    average : 35 ,
                    highest : 65 ,
                    lowest : 2
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
        // **@returns** a cluster object with the cluster name for the specific
        function getMockCluster(cluster_name) {
            var tempCluster =  _.find(mockClusters, function(cluster) {
                    return cluster.cluster_name === cluster_name;
            });
            return tempCluster === undefined ? byDefaultCluster : tempCluster;
        }

        return {
            getMockCluster: getMockCluster
        };
    });
})();
