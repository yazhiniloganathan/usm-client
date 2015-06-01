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
        // Mock clusters with hard coded data.
        var mockClusters = [
            {
                cluster_name : "gluster" ,
                alerts : 1 ,
                areaSpline_values : [ { '1': 5 }, { '1': 9 }, { '1': 50 }, { '1': 80 }, { '1': 82 }] ,
                gauge_values : [{ '1': 9 }] ,
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
                cluster_name : "new" ,
                alerts : 0 ,
                areaSpline_values : [ { '1': 2 }, { '1': 5 }, { '1': 20 }, { '1': 30 }, { '1': 60 }] ,
                gauge_values : [{ '1': 7 }] ,
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
            },
            {
                cluster_name : "newone" ,
                alerts : 0 ,
                areaSpline_values : [ { '1': 2 }, { '1': 20 }, { '1': 20 }, { '1': 30 }, { '1': 60 }] ,
                gauge_values : [{ '1': 6 }] ,
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
            getRandomList: getRandomList
        };
    });
})();
