import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Treemap, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ff6f61', '#a29bfe'];

export default function CXOSummary() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('https://eagleeye-dashboard.onrender.com/api/cxo')
      .then(res => setData(res.data))
      .catch(err => console.error('RiskTrend API error:', err));
  }, []);

  if (!data) return (
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


  const CustomTreemapContent = ({ x, y, width, height, IpPort }) => {
    const label = IpPort || 'Unknown';
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="#00c49f" stroke="#222" />
        {width > 40 && height > 20 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontSize="16"
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  const processedPrivilegeData = Object.values(
    (data.excessivePrivilegeData || []).reduce((acc, { hostname }) => {
      acc[hostname] = acc[hostname] || { hostname, count: 0 };
      acc[hostname].count += 1;
      return acc;
    }, {})
  );

  return (
    <div className="space-y-8">
      {/* Section 1: Risk Score and Timeseries */}
      <div className="bg-gray-900 text-white rounded-xl p-6 shadow space-y-4">
        <h2 className="text-3xl font-semibold text-white">Risk Trend</h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
          {/* Risk Score */}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Risk Score</h2>
            <div className={`text-5xl font-extrabold ${data.riskScore >= 6 ? "text-red-500"
              : data.riskScore >= 3 ? "text-yellow-400"
                : "text-green-400"} `}>{data.riskScore}<span className="text-base text-gray-400 font-medium">/ 10</span></div>
            <div className={`text-xl mt-3 ${data.riskCat === "High Risk" ? "text-red-500"
              : data.riskCat === "Medium Risk" ? "text-yellow-400"
                : "text-green-400"}`}>
              {data.riskCat}
            </div>
          </div>

          {/* Risk Trend Line Chart */}
          <div className="w-full sm:w-2/3 h-64 bg-gray-900 rounded-2xl shadow-md p-4">
            {data.timeseries.length === 0 ? (
              <div className="text-gray-400 text-center mt-20">No high/critical logs to show</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeseries}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#444" />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#555' }}
                    tickFormatter={(str) => format(parseISO(str), 'MMM dd')}
                  />
                  <YAxis
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#555' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                    labelStyle={{ color: '#93c5fd' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ r: 4, stroke: '#38bdf8', strokeWidth: 2, fill: '#0f172a' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Risk Category and Severity Value Trend */}
      <div className="flex flex-wrap -mx-2">
        {/* Risk Category Panel */}
        <div className="w-full sm:w-1/3 px-2">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 h-64 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Risk Category</h2>
              <div className={`text-2xl mt-3 ${data.riskCat === "High Risk" ? "text-red-500"
                : data.riskCat === "Medium Risk" ? "text-yellow-400"
                  : "text-green-400"}`}>
                {data.riskCat}
              </div>
            </div>
            <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700 custom-scrollbar">
              <h3 className="text-gray-400 mb-1">Top Contributing Messages</h3>
              {data.topContributors?.length > 0 ? (
                <ul className="list-disc list-inside text-blue-300">
                  {data.topContributors.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="whitespace-normal break-words">{item.message}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No contributors to display.</p>
              )}
            </div>
          </div>
        </div>

        {/* Severity Value Trend (unchanged) */}
        <div className="w-full sm:w-2/3 px-2">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 h-64">
            <h2 className="text-xl font-semibold mb-4">Severity Value Trend</h2>
            {data.severityValueTimeseries.length === 0 ? (
              <div className="text-gray-400 text-center">No data to display</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.severityValueTimeseries}>
                  <defs>
                    <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fill: '#ccc', fontSize: 12 }}
                    tickFormatter={(str) => format(parseISO(str), 'MMM dd')}
                    tickLine={false}
                    axisLine={{ stroke: '#555' }}
                  />
                  <YAxis
                    tick={{ fill: '#ccc', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#555' }}
                    tickFormatter={(value) => Math.round(value)}
                    domain={[0, (dataMax) => Math.ceil(dataMax)]}
                    allowDecimals={false}
                    tickCount={5}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                    labelStyle={{ color: '#93c5fd' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="averageSeverityValue"
                    stroke="#34d399"
                    fill="url(#colorSeverity)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Attack Surface + Excessive Privileges */}
      <div className="flex flex-wrap -mx-2">
        {/* Attack Surface */}
        <div className="w-full sm:w-1/2 px-2 mt-1">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 h-80">
            <h2 className="text-xl font-semibold mb-4">Accounts Increasing Attack Surface Risk</h2>
            {!data.attackSurfaceData?.length ? (
              <div className="text-gray-400 text-center">No attack surface data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.attackSurfaceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="host" tick={{ fill: '#ccc' }} />
                  <YAxis
                    tick={{ fill: '#ccc' }}
                    tickFormatter={(value) => Math.round(value)}  // Round to nearest integer
                    domain={[0, (dataMax) => Math.ceil(dataMax)]}  // Start at 0, round up max
                    allowDecimals={false}  // Prevent decimal ticks
                    tickCount={5}  // Suggest 5 ticks
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                    labelStyle={{ color: '#93c5fd' }}
                  />
                  <Bar dataKey="count" fill="#1f94f8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Excessive Privileges */}
        <div className="w-full sm:w-1/2 px-2 mt-1">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 h-80">
            <h2 className="text-xl font-semibold mb-4">Accounts with Excessive Privilege</h2>
            {!processedPrivilegeData.length ? (
              <div className="text-gray-400 text-center">No excessive privileges detected</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedPrivilegeData}>
                  <defs>
                    <linearGradient id="colorPriv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="hostname" tick={{ fill: '#ccc' }} />
                  <YAxis
                    tick={{ fill: '#ccc' }}
                    tickFormatter={(value) => Math.round(value)}  // Round to nearest integer
                    domain={[0, (dataMax) => Math.ceil(dataMax)]}  // Start at 0, round up max
                    allowDecimals={false}  // Prevent decimal ticks
                    tickCount={5}  // Suggest 5 ticks
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                    labelStyle={{ color: '#93c5fd' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#38bdf8"
                    fill="url(#colorPriv)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Internet Facing Ports + Insecure Connections */}
      <div className="flex flex-wrap -mx-2">
        <div className="w-full sm:w-1/2 px-2 mt-1">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Unexpected Internet Facing Ports</h2>
            {!data.internetFacingPorts?.length ? (
              <div className="text-gray-400 text-center py-16">No internet facing port data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <Treemap
                  data={data.internetFacingPorts}
                  dataKey="size"
                  nameKey="IpPort"
                  stroke="#333"
                  fill="#82ca9d"
                  content={CustomTreemapContent}
                />
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="w-full sm:w-1/2 px-2 mt-1">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">
              Total {data.totalInsecureConnections ?? 0} Insecure Connection Issues
            </h2>
            {data.connectionSurfaceData.length === 0 ? (
              <div className="text-gray-400 text-center py-16">No insecure connection logs to show</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.connectionSurfaceData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#444" />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#555' }}
                    tickFormatter={(str) => format(parseISO(str), 'MMM dd')}
                  />
                  <YAxis
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#555' }}
                    tickFormatter={(value) => Math.round(value)}  // Round to nearest integer
                    domain={[0, (dataMax) => Math.ceil(dataMax)]}  // Start at 0, round up max
                    allowDecimals={false}  // Prevent decimal ticks
                    tickCount={7}  // Suggest 5 ticks
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                    labelStyle={{ color: '#93c5fd' }}
                    formatter={(value) => [`${value}`, 'Count']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f87171"
                    strokeWidth={3}
                    dot={{ r: 4, stroke: '#f87171', strokeWidth: 2, fill: '#0f172a' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
