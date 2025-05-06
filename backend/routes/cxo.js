const express = require('express');
const router = express.Router();
const { Client } = require('@opensearch-project/opensearch');

// Global settings
const CALENDAR_INTERVAL = "month"; // Change this value to "day", "month", etc. as needed
const INDEX = 'newdemowindow';

// Configure OpenSearch client
const client = new Client({
  node: 'https://80.225.204.252:2222/',
  auth: {
    username: 'admin',
    password: '@Man21416181'
  },
  ssl: { rejectUnauthorized: false }
});

// GET /api/cxo/risk-trend
router.get('/cxo', async (req, res) => {
  try {
    const totalResp = await client.count({ index: INDEX });

    const highCritResp = await client.search({
      index: INDEX,
      size: 1000,
      body: {
        query: {
          terms: { Severity: ["INFO"] }
        },
        aggs: {
          per_hour: {
            date_histogram: {
              field: "EventTime",
              calendar_interval: CALENDAR_INTERVAL
            }
          }
        }
      }
    });

    const totalLogs = totalResp.body.count;
    const highCriticalLogs = highCritResp.body.hits.total.value;
    const highCriticalDocs = highCritResp.body.hits.hits;
    const riskScore = Math.max(0, ((highCriticalLogs / totalLogs) * 100) / 10).toFixed(1);

    const riskCat = riskScore >= 6 ? "High Risk" : riskScore >= 3 ? "Medium Risk" : "Low Risk";

    const timeseries = highCritResp.body.aggregations.per_hour.buckets.map(bucket => ({
      timestamp: bucket.key_as_string,
      count: bucket.doc_count
    }));

    const messageCountMap = {};
    highCriticalDocs.forEach(log => {
      const msg = log._source.Message;
      if (msg) {
        const firstSentence = msg.split('.')[0] + '.';
        messageCountMap[firstSentence] = (messageCountMap[firstSentence] || 0) + 1;
      }
    });

    const topMessages = Object.entries(messageCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([message, count]) => ({ message, count }));

    const severityValueAggResp = await client.search({
      index: INDEX,
      size: 0,
      body: {
        query: {
          exists: { field: "SeverityValue" }
        },
        aggs: {
          per_hour: {
            date_histogram: {
              field: "EventTime",
              calendar_interval: CALENDAR_INTERVAL
            },
            aggs: {
              avg_severity: {
                avg: { field: "SeverityValue" }
              }
            }
          }
        }
      }
    });

    const severityValueTimeseries = severityValueAggResp.body.aggregations.per_hour.buckets.map(bucket => ({
      timestamp: bucket.key_as_string,
      averageSeverityValue: bucket.avg_severity.value
    }));

    const attackSurfaceResp = await client.search({
      index: INDEX,
      size: 0,
      body: {
        query: {
          terms: { EventID: [4625, 4624, 4648, 4678] }
        },
        aggs: {
          by_hostname: {
            terms: { field: "Hostname", size: 10 }
          }
        }
      }
    });

    const attackSurfaceData = attackSurfaceResp.body.aggregations.by_hostname.buckets.map(bucket => ({
      host: bucket.key,
      count: bucket.doc_count
    }));

    const excessivePrivilegeResp = await client.search({
      index: INDEX,
      size: 1000,
      body: {
        query: {
          match_phrase: { Message: "allow" }
        }
      }
    });

    const excessivePrivilegeData = excessivePrivilegeResp.body.hits.hits.map(doc => {
      const src = doc._source;
      return {
        ip: src.IpAddress || src.SourceIp || "127.0.0.1",
        hostname: src.Hostname || src.ComputerName || "Unknown Host"
      };
    });

    const internetFacingResp = await client.search({
      index: INDEX,
      size: 1000,
      body: {
        query: { exists: { field: "IpPort" } },
        _source: ["IpPort"]
      }
    });

    const portMap = {};
    internetFacingResp.body.hits.hits.forEach(log => {
      const port = log._source.IpPort;
      if (port) {
        portMap[port] = (portMap[port] || 0) + 1;
      }
    });

    const internetFacingPorts = Object.entries(portMap).map(([IpPort, size]) => ({ IpPort, size }));

    const connectionSurfaceResp = await client.search({
      index: INDEX,
      size: 0,
      body: {
        query: {
          terms: { EventID: [4702, 4698, 4701, 6038, 16962] }
        },
        aggs: {
          events_over_time: {
            date_histogram: {
              field: "EventTime",
              calendar_interval: CALENDAR_INTERVAL
            }
          }
        }
      }
    });

    const connectionSurfaceData = connectionSurfaceResp.body.aggregations.events_over_time.buckets.map(bucket => ({
      timestamp: bucket.key_as_string,
      count: bucket.doc_count
    }));

    const totalInsecureConnections = connectionSurfaceData.reduce((sum, d) => sum + d.count, 0);

    res.json({
      totalLogs,
      highCriticalLogs,
      riskScore: parseFloat(riskScore),
      riskCat,
      topContributors: topMessages,
      timeseries,
      severityValueTimeseries,
      attackSurfaceData,
      excessivePrivilegeData,
      internetFacingPorts,
      connectionSurfaceData,
      totalInsecureConnections
    });
  } catch (err) {
    console.error('Risk trend error:', err);
    res.status(500).json({ error: err.message || 'Failed to calculate risk trend' });
  }
});

module.exports = router;
