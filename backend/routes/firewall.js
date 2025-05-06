// const express = require('express');
// const router = express.Router();
// const { Client } = require('@opensearch-project/opensearch');

// const INDEX = 'firewall';
// const client = new Client({
//     node: 'https://localhost:9200',
//     auth: { username: 'admin', password: 'Dharmil@124' },
//     ssl: { rejectUnauthorized: false }
// });

// router.get('/firewall', async (req, res) => {
//     try {
//         const [totalEvents, totalAlerts, casesInitiated, criticalHighCases, lowMediumCases] = await Promise.all([
//             client.count({ index: INDEX }),
//             client.count({
//                 index: INDEX,
//                 body: { query: { term: { alert: 1 } } }
//             }),
//             client.count({
//                 index: INDEX,
//                 body: { query: { bool: { must: [{ term: { alert: 1 } }, { term: { case: 1 } }] } } }
//             }),
//             client.count({
//                 index: INDEX,
//                 body: { query: { terms: { severity: ['critical', 'high'] } } }
//             }),
//             client.count({
//                 index: INDEX,
//                 body: { query: { terms: { severity: ['low', 'medium'] } } }
//             })
//         ]);

//         const trendVolumeData = await client.search({
//             index: INDEX,
//             size: 0,
//             body: {
//                 query: {
//                     term: { alert: 1 }  // Only alert logs
//                 },
//                 aggs: {
//                     alerts_over_time: {
//                         date_histogram: {
//                             field: '@timestamp',
//                             calendar_interval: 'day'  // You can change to 'week' or 'month'
//                         }
//                     }
//                 }
//             }
//         });

//         const trendData = trendVolumeData.body.aggregations.alerts_over_time.buckets.map(bucket => ({
//             timestamp: bucket.key_as_string,
//             count: bucket.doc_count
//         }));
//         const logVolumeData = await client.search({
//             index: INDEX,
//             size: 0,
//             body: {

//                 aggs: {
//                     alerts_over_time: {
//                         date_histogram: {
//                             field: '@timestamp',
//                             calendar_interval: 'week'  // You can change to 'week' or 'month'
//                         }
//                     }
//                 }
//             }
//         });

//         const logData = logVolumeData.body.aggregations.alerts_over_time.buckets.map(bucket => ({
//             timestamp: bucket.key_as_string,
//             count: bucket.doc_count
//         }));

//         const topAlerts = await client.search({
//             index: INDEX,
//             size: 0,
//             body: {
//                 query: {
//                     term: { alert: 1 } // Only alerts
//                 },
//                 aggs: {
//                     top_alerts: {
//                         terms: {
//                             field: "rule_name",
//                             size: 10
//                         }
//                     }
//                 }
//             }
//         });

//         const topAlertsData = topAlerts.body.aggregations.top_alerts.buckets.map(bucket => ({
//             rule_name: bucket.key,
//             count: bucket.doc_count
//         }));

//         const [actionsResp, top5Resp] = await Promise.all([
//             client.search({
//                 index: INDEX,
//                 size: 0,
//                 body: {
//                     aggs: {
//                         firewall_actions: {
//                             terms: {
//                                 field: "firewall_action",
//                                 size: 10
//                             }
//                         }
//                     }
//                 }
//             }),
//             client.search({
//                 index: INDEX,
//                 size: 0,
//                 body: {
//                     query: { term: { alert: 1 } },
//                     aggs: {
//                         top_alerts: {
//                             terms: {
//                                 field: "rule_name",
//                                 size: 5
//                             }
//                         }
//                     }
//                 }
//             })
//         ]);

//         const actions = actionsResp.body.aggregations.firewall_actions.buckets.map(bucket => ({
//             action: bucket.key,
//             count: bucket.doc_count
//         }));

//         const top5Alerts = top5Resp.body.aggregations.top_alerts.buckets.map(bucket => ({
//             rule_name: bucket.key,
//             count: bucket.doc_count
//         }));

//         const geoData = await client.search({
//             index: INDEX,
//             size: 0,
//             body: {
//                 aggs: {
//                     by_country: {
//                         terms: {
//                             field: "geo_location",  // Assuming geo_location holds country names
//                             size: 100
//                         }
//                     }
//                 }
//             }
//         });

//         const locations = geoData.body.aggregations.by_country.buckets.map(bucket => ({
//             country: bucket.key,
//             count: bucket.doc_count
//         }));

//         res.json({
//             totalEvents: totalEvents.body.count,
//             totalAlerts: totalAlerts.body.count,
//             casesInitiated: casesInitiated.body.count,
//             criticalHighCases: criticalHighCases.body.count,
//             lowMediumCases: lowMediumCases.body.count,
//             logtrend : logData,
//             trend: trendData,
//             topAlert: topAlertsData,
//             topAction: actions,
//             top5AlertsData: top5Alerts,
//             location: locations
//         });
//     } catch (err) {
//         console.error('Firewall Summary Error:', err);
//         res.status(500).json({ error: err.message || 'Error fetching firewall summary' });
//     }
// });

// module.exports = router;




// NEW CODE


const express = require('express');
const router = express.Router();
const { Client } = require('@opensearch-project/opensearch');

const INDEX = 'firewall';
const client = new Client({
    node: 'https://80.225.204.252:2222/',
    auth: { username: 'admin', password: '@Man21416181' },
    ssl: { rejectUnauthorized: false }
});

router.get('/firewall', async (req, res) => {
    const { range = '90d', interval = 'day' } = req.query;
    const rangeQuery = {
        range: {
            '@timestamp': {
                gte: `now-${range}`,
                lte: 'now'
            }
        }
    };

    try {
        const [
            totalEvents,
            totalAlerts,
            casesInitiated,
            criticalHighCases,
            lowMediumCases
        ] = await Promise.all([
            client.count({ index: INDEX }),
            client.count({ index: INDEX, body: { query: { term: { alert: 1 } } } }), // Assuming `alert` is boolean
            client.count({
                index: INDEX,
                body: {
                    query: {
                        bool: {
                            must: [
                                { term: { alert: 1 } },
                                { term: { case: 1 } },
                            ],
                        },
                    },
                },
            }),
            client.count({
                index: INDEX,
                body: {
                    query: {
                        bool: {
                            must: [
                                { terms: { severity: ['critical', 'high'] } },
                                { term: { alert: 1 } }, // Already updated
                            ],
                        },
                    },
                },
            }),
            client.count({
                index: INDEX,
                body: {
                    query: {
                        bool: {
                            must: [
                                { terms: { severity: ['low', 'medium'] } },
                                { term: { alert: 1 } }, // Added alert condition
                            ],
                        },
                    },
                },
            }),
        ]);

        const trendVolumeData = await client.search({
            index: INDEX,
            size: 0,
            body: {
                query: { bool: { must: [rangeQuery, { term: { alert: 1 } }] } },
                aggs: {
                    alerts_over_time: {
                        date_histogram: {
                            field: '@timestamp',
                            calendar_interval: interval
                        }
                    }
                }
            }
        });

        const trendData = trendVolumeData.body.aggregations.alerts_over_time.buckets.map(bucket => ({
            timestamp: bucket.key_as_string,
            count: bucket.doc_count
        }));

        const logVolumeData = await client.search({
            index: INDEX,
            size: 0,
            body: {
                query: rangeQuery,
                aggs: {
                    alerts_over_time: {
                        date_histogram: {
                            field: '@timestamp',
                            calendar_interval: interval
                        }
                    }
                }
            }
        });

        const logData = logVolumeData.body.aggregations.alerts_over_time.buckets.map(bucket => ({
            timestamp: bucket.key_as_string,
            count: bucket.doc_count
        }));

        const topAlerts = await client.search({
            index: INDEX,
            size: 0,
            body: {
                query: { bool: { must: [rangeQuery, { term: { alert: 1 } }] } },
                aggs: {
                    top_alerts: {
                        terms: {
                            field: 'rule_name',
                            size: 10
                        }
                    }
                }
            }
        });

        const topAlertsData = topAlerts.body.aggregations.top_alerts.buckets.map(bucket => ({
            rule_name: bucket.key,
            count: bucket.doc_count
        }));

        const [actionsResp, top5Resp] = await Promise.all([
            client.search({
                index: INDEX,
                size: 0,
                body: {
                    query: rangeQuery,
                    aggs: {
                        firewall_actions: {
                            terms: {
                                field: 'firewall_action',
                                size: 10
                            }
                        }
                    }
                }
            }),
            client.search({
                index: INDEX,
                size: 0,
                body: {
                    query: { bool: { must: [rangeQuery, { term: { alert: 1 } }] } },
                    aggs: {
                        top_alerts: {
                            terms: {
                                field: 'rule_name',
                                size: 5
                            }
                        }
                    }
                }
            })
        ]);

        const actions = actionsResp.body.aggregations.firewall_actions.buckets.map(bucket => ({
            action: bucket.key,
            count: bucket.doc_count
        }));

        const top5Alerts = top5Resp.body.aggregations.top_alerts.buckets.map(bucket => ({
            rule_name: bucket.key,
            count: bucket.doc_count
        }));

        const geoData = await client.search({
            index: INDEX,
            size: 0,
            body: {
                query: rangeQuery,
                aggs: {
                    by_country: {
                        terms: {
                            field: 'geo_location',
                            size: 100
                        }
                    }
                }
            }
        });

        const locations = geoData.body.aggregations.by_country.buckets.map(bucket => ({
            country: bucket.key,
            count: bucket.doc_count
        }));

        res.json({
            totalEvents: totalEvents.body.count,
            totalAlerts: totalAlerts.body.count,
            casesInitiated: casesInitiated.body.count,
            criticalHighCases: criticalHighCases.body.count,
            lowMediumCases: lowMediumCases.body.count,
            logtrend: logData,
            trend: trendData,
            topAlert: topAlertsData,
            topAction: actions,
            top5AlertsData: top5Alerts,
            location: locations
        });
    } catch (err) {
        console.error('Firewall Summary Error:', err);
        res.status(500).json({ error: err.message || 'Error fetching firewall summary' });
    }
});

module.exports = router;
