import { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useMapContext } from 'react-simple-maps';
import { useDateRange } from './DateRangeContext';

export default function FirewallDashboard() {
    const [summary, setSummary] = useState(null);
    const { range, interval } = useDateRange();

    const fetchData = () => {
        axios.get(`https://eagleeye-dashboard.onrender.com/api/firewall?range=${range}&interval=${interval}`)
            .then(res => setSummary(res.data))
            .catch(err => console.error('Firewall Summary API error:', err));
    };

    useEffect(() => {
        fetchData();
    }, [range, interval]);

    if (!summary) return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-6 py-10 relative overflow-hidden"
            style={{
                backgroundImage: `url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCL2GuXkm4vnkAnNz1yA4Kxlg-jjKIOdohivr_s_uCRQ5z1gYjlSJX139c7I-iR-2i3sCVQK3kmP3_ZRvvBezy_m5eB-sX9N3cn42lJbi5PveE90jfqPt4Luc52J6nU1MTIWZGkdBzT76fTVru6Wk8RafSOcgNzPumjNLay5fUxQ_YIihCHQ7Us1_-wVMV/s400/Eagleye-S.png')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '400px',
                backgroundBlendMode: 'soft-light',
            }}
        >
            <div className="bg-gray-950/80 p-6 rounded-2xl shadow-lg animate-pulse">
                <span className="text-2xl font-bold">Loading<span className="animate-ping ml-2">...</span></span>
            </div>
        </div>
    );

    const metrics = [
        { label: 'Total Events', value: summary.totalEvents, color: 'text-blue-300' },
        { label: 'Total Alerts', value: summary.totalAlerts, color: 'text-orange-400' },
        { label: 'Cases Initiated', value: summary.casesInitiated, color: 'text-yellow-400' },
        { label: 'Critical/High Cases', value: summary.criticalHighCases, color: 'text-red-400' },
        { label: 'Low/Medium Cases', value: summary.lowMediumCases, color: 'text-green-400' },
    ];

    const geoUrl = "/maps/ne_10m_admin_0_countries.geojson";

    const countryCoordinates = {
        "India": { lat: 20.5937, lon: 78.9629 },
        "USA": { lat: 37.0902, lon: -95.7129 },
        "Germany": { lat: 51.1657, lon: 10.4515 },
        "Australia": { lat: -25.2744, lon: 133.7751 },
        "Canada": { lat: 56.1304, lon: -106.3468 },
        "France": { lat: 46.2276, lon: 2.2137 },
        "Japan": { lat: 36.2048, lon: 138.2529 },
    };

    const FlowPaths = ({ locations }) => {
        const { projection } = useMapContext();
        const paths = [];

        for (let i = 0; i < locations.length - 1; i++) {
            const start = countryCoordinates[locations[i].country];
            const end = countryCoordinates[locations[i + 1].country];

            if (start && end) {
                const [x1, y1] = projection([start.lon, start.lat]);
                const [x2, y2] = projection([end.lon, end.lat]);
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2 - 50;
                const pathD = `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
                paths.push(pathD);
            }
        }

        return (
            <g>
                {paths.map((d, idx) => (
                    <path
                        key={idx}
                        d={d}
                        stroke="#38bdf8"
                        strokeWidth={0.5}
                        fill="none"
                        strokeDasharray="10 5"
                        style={{ filter: 'drop-shadow(0 0 2px rgba(56, 189, 248, 0.5))' }}
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            from="15"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </path>
                ))}
            </g>
        );
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

            {/* Trend in log volume */}
            <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
                <h2 className="text-xl font-semibold">Trend in Log  Volume</h2>
                {summary.logtrend.length === 0 ? (
                    <div className="text-gray-400 text-center py-16">No Log data available</div>
                ) : (
                    <div className="h-64 min-h-[16rem]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summary.logtrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="timestamp" tick={{ fill: '#ccc', fontSize: 12 }}
                                    tickFormatter={(str) => format(parseISO(str), 'MMM dd')}
                                    tickLine={false}
                                    axisLine={{ stroke: '#555' }}
                                />
                                <YAxis tick={{ fill: '#ccc', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#555' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} labelStyle={{ color: '#93c5fd' }} />
                                <Line type="monotone" dataKey="count" stroke="rgba(121, 255, 68, 0.7)" strokeWidth={3}
                                    dot={{ r: 4, stroke: 'rgba(121, 255, 68, 0.7)', strokeWidth: 2, fill: 'rgba(121, 255, 68, 0.7)' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
                <h2 className="text-xl font-semibold">Trend in Alert Volume</h2>
                {summary.trend.length === 0 ? (
                    <div className="text-gray-400 text-center py-16">No alert data available</div>
                ) : (
                    <div className="h-64 min-h-[16rem]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summary.trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="timestamp" tick={{ fill: '#ccc', fontSize: 12 }}
                                    tickFormatter={(str) => format(parseISO(str), 'MMM dd')}
                                    tickLine={false}
                                    axisLine={{ stroke: '#555' }}
                                />
                                <YAxis tick={{ fill: '#ccc', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#555' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} labelStyle={{ color: '#93c5fd' }} />
                                <Line type="monotone" dataKey="count" stroke="#f87171" strokeWidth={3}
                                    dot={{ r: 4, stroke: '#f87171', strokeWidth: 2, fill: '#0f172a' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Top 10 Alerts */}
            <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6 overflow-x-auto">
                <h2 className="text-xl font-semibold">Top 10 Alerts by Rule Name</h2>
                {!summary.topAlert || summary.topAlert.length === 0 ? (
                    <div className="text-gray-400 text-center py-16">No alert data available</div>
                ) : (
                    <div style={{ height: `${summary.topAlert.length * 40}px` }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.topAlert} layout="vertical" margin={{ left: 50, right: 20 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#7dd3fc" />
                                        <stop offset="100%" stopColor="#1e3a8a" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis type="number" tick={{ fill: '#ccc' }} />
                                <YAxis dataKey="rule_name" type="category" tick={{ fill: '#ccc', fontSize: 14 }} width={180} interval={0} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} labelStyle={{ color: '#93c5fd' }} />
                                <Bar dataKey="count" fill="url(#barGradient)" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
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
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} labelStyle={{ color: '#93c5fd' }} />
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
                                    <YAxis dataKey="rule_name" type="category" tick={{ fill: '#ccc', fontSize: 14 }} width={180} interval={0} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} labelStyle={{ color: '#93c5fd' }} />
                                    <Bar dataKey="count" fill="#38bdf8" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Other charts and sections are unchanged... */}

            {/* Geolocation Map */}
            <div className="bg-gray-950 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
                <h2 className="text-xl font-semibold">Geolocation of Alerts</h2>
                <div className="relative" style={{ paddingBottom: '62.5%' }}>
                    <ComposableMap
                        projection="geoEqualEarth"
                        width={800}
                        height={500}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies
                                    .filter(geo => geo.properties.ADMIN !== "Antarctica")
                                    .map(geo => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#2d3748"
                                            stroke="#718096"
                                        />
                                    ))
                            }
                        </Geographies>

                        {summary.location.map((loc, idx) => {
                            const coords = countryCoordinates[loc.country];
                            if (!coords) return null;
                            return (
                                <Marker key={idx} coordinates={[coords.lon, coords.lat]}>
                                    <circle
                                        r={5}
                                        fill="rgba(248, 56, 56, 0.7)"
                                        stroke="#0ea5e9"
                                        strokeWidth={1.5}
                                        style={{ filter: 'drop-shadow(0 0 2px rgba(233, 14, 14, 0.8))' }}
                                    />
                                    <text
                                        textAnchor="middle"
                                        y={-12}
                                        style={{ fontFamily: 'system-ui', fill: '#fff', fontSize: '10px' }}
                                    >
                                        {loc.country} ({loc.count})
                                    </text>
                                </Marker>
                            );
                        })}

                        <FlowPaths locations={summary.location} />
                    </ComposableMap>
                </div>
            </div>
        </div>
    );
}
