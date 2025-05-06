import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend
} from 'recharts';

export default function ExecutiveDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('https://eagleeye-dashboard.onrender.com/api/executive')
      .then(res => setData(res.data))
      .catch(err => console.error('Executive API error:', err));
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

  const severityColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  return (
    <div className="space-y-8">
      {/* Counts Section */}
      <div className="bg-gray-900 text-white rounded-xl p-6 shadow space-y-4" >
        <h2 className="text-xl font-semibold">Alert Statistics Dashboard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <div className="text-lg text-orange-400 font-bold">High</div>
            <div className="text-3xl font-extrabold">{data.severityCounts.high}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <div className="text-lg text-yellow-400 font-bold">Medium</div>
            <div className="text-3xl font-extrabold">{data.severityCounts.medium}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <div className="text-lg text-green-400 font-bold">Low</div>
            <div className="text-3xl font-extrabold">{data.severityCounts.low}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <div className="text-lg text-red-400 font-bold">Critical</div>
            <div className="text-3xl font-extrabold">{data.severityCounts.critical}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <div className="text-lg text-cyan-400 font-bold">Total</div>
            <div className="text-3xl font-extrabold">{data.severityCounts.total}</div>
          </div>
        </div>
      </div>

      {/* Timeseries Chart Section */}
      <div className="bg-gray-900 text-white rounded-xl p-6 shadow space-y-4">
        {data.severityBuckets.length === 0 ? (
          <div className="text-gray-400 text-center mt-20">No timeseries data available</div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.severityBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#555' }}
                />
                <YAxis
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#555' }}
                  tickFormatter={(value) => Math.round(value)}  // Round to nearest integer
                  domain={[0, (dataMax) => Math.ceil(dataMax)]}  // Start at 0, round up max
                  allowDecimals={false}  // Prevent decimal ticks
                  tickCount={5}  // Suggest 5 ticks
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#93c5fd' }}
                  formatter={(value, name) => [`${value}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Line type="monotone" dataKey="critical" stroke={severityColors.critical} strokeWidth={2} />
                <Line type="monotone" dataKey="high" stroke={severityColors.high} strokeWidth={2} />
                <Line type="monotone" dataKey="medium" stroke={severityColors.medium} strokeWidth={2} />
                <Line type="monotone" dataKey="low" stroke={severityColors.low} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Vector wise Attack and Affected Asset in One Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Vector wise Attack Bar Chart */}
        <div className="bg-gray-900 text-white rounded-xl p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold">Vector wise Attack</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.vectorAttackData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="accountType" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />

              {/* Changed the fill color here */}
              <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} isAnimationActive={false}
                activeShape={{
                  fill: "transparent", // Remove background color on hover
                }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Affected Asset Bar Chart */}
        <div className="bg-gray-900 text-white rounded-xl p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold">Total {data.totalaffectedCounts} Affected Asset</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.affectedAssetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="ip" stroke="#ccc" />
              <YAxis stroke="#ccc"
                tickFormatter={(value) => Math.round(value)}  // Round to nearest integer
                domain={[0, (dataMax) => Math.ceil(dataMax)]}  // Start at 0, round up max
                allowDecimals={false}  // Prevent decimal ticks
                tickCount={5}  // Suggest 5 ticks
              />
              <Tooltip />
              <Legend />
              {/* Changed the fill color here */}
              <Bar dataKey="count" fill="#1f94f8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>


    </div>
  );
}
