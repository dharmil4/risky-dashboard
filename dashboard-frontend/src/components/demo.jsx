import { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useDateRange } from './DateRangeContext';

export default function DemoDashboard() {
    const [summary, setSummary] = useState(null);
    const [selectedRule, setSelectedRule] = useState(null); // State to store the selected rule name
    const [logs, setLogs] = useState([]); // State to store logs for the selected rule
    const { range, interval } = useDateRange();

    // Fetch summary data
    const fetchData = () => {
        axios.get(`http://192.168.1.135:4000/api/demo?range=${range}&interval=${interval}`)
            .then(res => setSummary(res.data))
            .catch(err => console.error('Firewall Summary API error:', err));
    };

    // Fetch logs for a specific rule name
    const fetchLogsForRule = (ruleName) => {
        axios.get(`http://192.168.1.135:4000/api/demo/logs?rule_name=${encodeURIComponent(ruleName)}&range=${range}&interval=${interval}`)
            .then(res => {
                setLogs(res.data.logs || []); // Assuming the API returns { logs: [...] }
                setSelectedRule(ruleName);
            })
            .catch(err => console.error(`Error fetching logs for rule ${ruleName}:`, err));
    };

    useEffect(() => {
        fetchData();
    }, [range, interval]);

    if (!summary) {
        return (
            <div className="bg-gray-900 text-white p-6 rounded-xl shadow text-center">
                <span>Loading Firewall Summary...</span>
            </div>
        );
    }

    const metrics = [
        { label: 'Total Events', value: summary.totalEvents, color: 'text-blue-300' },
        { label: 'Total Alerts', value: summary.totalAlerts, color: 'text-orange-400' },
        { label: 'Cases Initiated', value: summary.casesInitiated, color: 'text-yellow-400' },
        { label: 'Critical/High Cases', value: summary.criticalHighCases, color: 'text-red-400' },
        { label: 'Low/Medium Cases', value: summary.lowMediumCases, color: 'text-green-400' },
    ];

    // Handle bar click
    const handleBarClick = (data) => {
        const ruleName = data.rule_name;
        fetchLogsForRule(ruleName);
    };

    // Clear the logs view
    const clearLogs = () => {
        setSelectedRule(null);
        setLogs([]);
    };

    return (
        <div className="space-y-8">
            {/* Counts */}
            <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6 shadow space-y-5">
                <h2 className="text-xl font-semibold">Firewall Statistics Dashboard</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {metrics.map((item, idx) => (
                        <div key={idx} className="bg-gray-800 p-4 rounded-xl text-center">
                            <div className={`text-lg font-bold ${item.color}`}>{item.label}</div>
                            <div className="text-2xl font-extrabold">{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top 10 Alerts */}
            <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6 overflow-x-auto">
                <h2 className="text-xl font-semibold">Top 10 Alerts by Rule Name</h2>
                {!summary.topAlert || summary.topAlert.length === 0 ? (
                    <div className="text-gray-400 text-center py-16">No alert data available</div>
                ) : (
                    <div style={{ height: `${summary.topAlert.length * 40}px` }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={summary.topAlert}
                                layout="vertical"
                                margin={{ left: 50, right: 20 }}
                                onClick={(data, index) => {
                                    if (data && data.activePayload && data.activePayload[0]) {
                                        handleBarClick(data.activePayload[0].payload);
                                    }
                                }}
                            >
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#7dd3fc" />
                                        <stop offset="100%" stopColor="#1e3a8a" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis type="number" tick={{ fill: '#ccc' }} />
                                <YAxis
                                    dataKey="rule_name"
                                    type="category"
                                    tick={{ fill: '#ccc', fontSize: 14 }}
                                    width={180}
                                    interval={0}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                                    labelStyle={{ color: '#93c5fd' }}
                                />
                                <Bar dataKey="count" fill="url(#barGradient)" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Display logs for the selected rule */}
                {selectedRule && (
                    <div className="mt-6 bg-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Logs for Rule: {selectedRule}
                            </h3>
                            <button
                                onClick={clearLogs}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                                Close
                            </button>
                        </div>
                        {logs.length === 0 ? (
                            <div className="text-gray-400 text-center py-4">
                                No logs found for this rule.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-600">
                                            <th className="p-2 text-gray-300">Timestamp</th>
                                            <th className="p-2 text-gray-300">Source IP</th>
                                            <th className="p-2 text-gray-300">Source Port</th>
                                            <th className="p-2 text-gray-300">Destination IP</th>
                                            <th className="p-2 text-gray-300">Destination Port</th>
                                            <th className="p-2 text-gray-300">Severity</th>
                                            <th className="p-2 text-gray-300">Event ID</th>
                                            <th className="p-2 text-gray-300">Rule Name</th>
                                            <th className="p-2 text-gray-300">Alert</th>
                                            <th className="p-2 text-gray-300">Case</th>
                                            <th className="p-2 text-gray-300">Firewall Action</th>
                                            <th className="p-2 text-gray-300">Geo Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log, idx) => (
                                            <tr key={idx} className="border-b border-gray-700">
                                                <td className="p-2">{log.timestamp}</td>
                                                <td className="p-2">{log.src_ip}</td>
                                                <td className="p-2">{log.src_port}</td>
                                                <td className="p-2">{log.dest_ip}</td>
                                                <td className="p-2">{log.dest_port}</td>
                                                <td className="p-2">{log.severity}</td>
                                                <td className="p-2">{log.event_id}</td>
                                                <td className="p-2">{log.rule_name}</td>
                                                <td className="p-2">{log.alert}</td>
                                                <td className="p-2">{log.case}</td>
                                                <td className="p-2">{log.firewall_action}</td>
                                                <td className="p-2">{log.geo_location}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions Taken + Top 5 Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Actions */}
                <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6 shadow space-y-4">
                    <h2 className="text-xl font-semibold">Actions Taken by Firewall</h2>
                    {summary.topAction.length === 0 ? (
                        <div className="text-gray-400 text-center py-16">No action data available</div>
                    ) : (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.topAction}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                    <XAxis dataKey="action" tick={{ fill: '#ccc' }} />
                                    <YAxis tick={{ fill: '#ccc' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                                        labelStyle={{ color: '#93c5fd' }}
                                    />
                                    <Bar dataKey="count" fill="#4ade80" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Top 5 Alerts */}
                <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6 shadow space-y-4">
                    <h2 className="text-xl font-semibold">Top 5 Alerts</h2>
                    {summary.top5AlertsData.length === 0 ? (
                        <div className="text-gray-400 text-center py-16">No alert data available</div>
                    ) : (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.top5AlertsData} layout="vertical" margin={{ left: 50, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                    <XAxis type="number" tick={{ fill: '#ccc' }} />
                                    <YAxis
                                        dataKey="rule_name"
                                        type="category"
                                        tick={{ fill: '#ccc', fontSize: 14 }}
                                        width={180}
                                        interval={0}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                                        labelStyle={{ color: '#93c5fd' }}
                                    />
                                    <Bar dataKey="count" fill="#38bdf8" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}