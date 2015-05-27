/*global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {
        // When cluster name will not match with any exist object , than this will be by default cluster.
        var byDefaultCluster = {
            cluster_name: "default",
            description: 'default desc',
            data_used: 20,
            alerts: 0,
            areaSpline_values: [{
                '1': 2
            }, {
                '1': 12
            }, {
                '1': 80
            }, {
                '1': 20
            }, {
                '1': 90
            }],
            gauge_values: [{
                '1': 78
            }],
            cpu: {
                average: 45,
                highest: 90,
                lowest: 3
            },
            memory: {
                average: 34,
                highest: 75,
                lowest: 8
            },
            management_network: {
                inbound: 301,
                outbound: 288
            },
            cluster_network: {
                inbound: 402,
                outbound: 327
            }
        };
        // Mock clusters with hard coded data.
        var mockClusters = [
            {
                cluster_name: "second_cluster",
                cluster_type: "gluster",
                description: "Openstack Swift",
                data_used: 30,
                alerts: 1,
                areaSpline_values: [{
                    '1': 5
                }, {
                    '1': 9
                }, {
                    '1': 50
                }, {
                    '1': 30
                }, {
                    '1': 80
                }],
                gauge_values: [{
                    '1': 53
                }],
                utilization: {
                    total: 3.5,
                    used: 1.1
                },
                iops: {
                    read: 340,
                    write: 210
                },
                cpu: {
                    average: 28,
                    highest: 79,
                    lowest: 5
                },
                memory: {
                    average: 31,
                    highest: 85,
                    lowest: 9
                },
                management_network: {
                    inbound: 305,
                    outbound: 250
                },
                cluster_network: {
                    inbound: 311,
                    outbound: 288
                },
                entity: {
                    hosts: {
                        count: 37,
                        critical: 0,
                        warning: 0
                    },
                    volumes: {
                        count: 13,
                        critical: 2,
                        warning: 1
                    },
                    bricks: {
                        count: 220,
                        critical: 1,
                        warning: 3
                    },
                    pools: {
                        count: 13,
                        critical: 0,
                        warning: 1
                    },
                    pgs: {
                        count: 670,
                        critical: 3,
                        warning: 0
                    },
                    osds: {
                        count: 237,
                        critical: 1,
                        warning: 0
                    }
                },
                heatmap: {
                    performance: [10, 91, 72, 33, 24,
                                    85, 16, 57, 88, 29,
                                    14, 13, 32, 31, 80,
                                    11, 92, 73, 34, 7,
                                    77, 83, 46, 35, 86],
                    utilization: [11, 92, 73, 34, 7,
                                    14, 13, 32, 31, 80,
                                    85, 16, 57, 88, 29,
                                    77, 83, 46, 35, 86,
                                    10, 91, 72, 33, 24],
                    uptime: [85, 16, 57, 88, 29,
                                    11, 92, 73, 34, 7,
                                    14, 13, 32, 31, 80,
                                    10, 91, 72, 33, 24,
                                    77, 83, 46, 35, 86
                                    ]
                }
            }
        ];
        // **@returns** a cluster object with the cluster name for the specific
        function getMockCluster(cluster_name) {
            var tempCluster = _.find(mockClusters, function(cluster) {
                return cluster.cluster_name === cluster_name;
            });
            return tempCluster === undefined ? byDefaultCluster : tempCluster;
        }
        return {
            getMockCluster: getMockCluster
        };
    });
})();