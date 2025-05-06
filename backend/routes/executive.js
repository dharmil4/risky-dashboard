const express = require('express');
const router = express.Router();
const { Client } = require('@opensearch-project/opensearch');

const INDEX = 'newdemowindow';
const CALENDAR_INTERVAL = 'month';

const client = new Client({
  node: 'https://80.225.204.252:2222/',
  auth: {
    username: 'admin',
    password: '@Man21416181'
  },
  ssl: { rejectUnauthorized: false }
});

router.get('/executive', async (req, res) => {
  try {
    // === Severity Counts ===
    const totalSummary = await client.search({
      index: INDEX,
      size: 10000,
      _source: ['SeverityValue'],
      body: {
        query: {
          range: {
            SeverityValue: {
              gte: 0
            }
          }
        }
      }
    });

    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    };

    totalSummary.body.hits.hits.forEach(hit => {
      const severity = hit._source.SeverityValue;
      if (severity >= 8) severityCounts.critical++;
      else if (severity >= 5) severityCounts.high++;
      else if (severity >= 3) severityCounts.medium++;
      else severityCounts.low++;
      severityCounts.total++;
    });

    // === Severity Timeseries ===
    const timeseriesResult = await client.search({
      index: INDEX,
      size: 0,
      body: {
        query: {
          range: {
            SeverityValue: {
              gte: 0
            }
          }
        },
        aggs: {
          per_day: {
            date_histogram: {
              field: 'EventTime',
              calendar_interval: CALENDAR_INTERVAL,
              format: 'MMM dd'
            },
            aggs: {
              critical: {
                filter: { range: { SeverityValue: { gte: 8 } } }
              },
              high: {
                filter: { range: { SeverityValue: { gte: 5, lt: 8 } } }
              },
              medium: {
                filter: { range: { SeverityValue: { gte: 3, lt: 5 } } }
              },
              low: {
                filter: { range: { SeverityValue: { lt: 3 } } }
              }
            }
          }
        }
      }
    });

    const severityBuckets = timeseriesResult.body.aggregations.per_day.buckets.map(bucket => ({
      date: bucket.key_as_string,
      critical: bucket.critical.doc_count,
      high: bucket.high.doc_count,
      medium: bucket.medium.doc_count,
      low: bucket.low.doc_count
    }));

    // ==================== Vector Wise Attack (AccountType counts) ====================
    const vectorAttack = await client.search({
        index: INDEX,
        size: 100,
        body: {
          aggs: {
            accountTypes: {
              terms: {
                field: 'Hostname',
                size: 10
              }
            }
          }
        }
      });
  
      const vectorAttackData = vectorAttack.body.aggregations.accountTypes.buckets.map(bucket => ({
        accountType: bucket.key,
        count: bucket.doc_count
      }));

// ==================== Affected Asset (Severity > 7, show IPs) ====================
      const affectedasset = await client.search({
        index: INDEX,
        size: 0,
        body: {
          query: {
            range: {
              SeverityValue: {
                gt: 1
              }
            }
          },
          aggs: {
            affectedIPs: {
              terms: {
                field: 'IpAddress',
                size: 10
              }
            }
          }
        }
      });
  
      const affectedAssetData = affectedasset.body.aggregations.affectedIPs.buckets.map(bucket => ({
        ip: bucket.key,
        count: bucket.doc_count
      }));

      const totalaffectedCounts = affectedAssetData.length;




    res.json({
      severityCounts,
      severityBuckets,
      vectorAttackData,
      affectedAssetData,
      totalaffectedCounts
    });
  } catch (err) {
    console.error('Executive API Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

module.exports = router;
