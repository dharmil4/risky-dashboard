import { useEffect, useState } from 'react';
import { useDateRange } from './DateRangeContext';

// LiveClock component (unchanged)
const LiveClock = ({ theme = 'lightBlue' }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  const themes = {
    lightBlue: {
      gradient: 'from-blue-200 to-blue-400',
      textShadow: '0 0 8px rgba(147, 197, 253, 0.6), 0 0 15px rgba(96, 165, 250, 0.4)',
      backgroundGradient: 'from-blue-200 to-blue-400',
    },
    blackWhite: {
      gradient: 'from-gray-800 to-gray-200',
      textShadow: '0 0 8px rgba(255, 255, 255, 0.4), 0 0 15px rgba(255, 255, 255, 0.2)',
      backgroundGradient: 'from-gray-600 to-gray-400',
    },
  };

  const selectedTheme = themes[theme] || themes.lightBlue;

  return (
    <div className="relative text-sm font-mono bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg shadow-lg overflow-hidden" style={{ zIndex: 5 }}>
      <span
        className={`text-transparent bg-clip-text bg-gradient-to-r ${selectedTheme.gradient}`}
        style={{ textShadow: selectedTheme.textShadow }}
      >
        {currentTime}
      </span>
      <div
        className={`absolute inset-0 bg-gradient-to-r ${selectedTheme.backgroundGradient} opacity-20 animate-pulse`}
        style={{ zIndex: -1 }}
      />
    </div>
  );
};

// EventRateIndicator component for SIEM
const EventRateIndicator = () => {
  const [eventsPerSecond, setEventsPerSecond] = useState(1234); // Initial EPS value

  useEffect(() => {
    // Simulate live updates with random fluctuation
    const updateEventRate = () => {
      const newRate = Math.floor(Math.random() * 6000) + 100; // Random between 100 and 6100
      setEventsPerSecond(newRate);
    };

    updateEventRate(); // Initial update
    const timer = setInterval(updateEventRate, 3000); // Update every 5 seconds

    return () => clearInterval(timer);
  }, []);

  // Determine color and glow based on EPS
  const getStyle = (eps) => {
    if (eps > 5000) {
      return {
        color: 'text-red-500',
        dotColor: 'bg-red-500',
        glow: '0 0 8px rgba(239, 68, 68, 0.6)',
      };
    } else if (eps >= 1000) {
      return {
        color: 'text-yellow-500',
        dotColor: 'bg-yellow-500',
        glow: '0 0 8px rgba(234, 179, 8, 0.6)',
      };
    } else {
      return {
        color: 'text-green-500',
        dotColor: 'bg-green-500',
        glow: '0 0 8px rgba(34, 197, 94, 0.6)',
      };
    }
  };

  const selectedStyle = getStyle(eventsPerSecond);

  return (
    <div className="flex items-center gap-2 bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg shadow-lg">
      <span className="text-sm font-mono text-white">EVENTS PER SECOND:</span>
      <span
        className={`text-sm font-mono ${selectedStyle.color}`}
        style={{ textShadow: selectedStyle.glow }}
      >
        {Math.round(eventsPerSecond).toLocaleString()} EPS {/* Round EPS to integer */}
      </span>
      <div
        className={`w-3 h-3 rounded-full ${selectedStyle.dotColor} animate-pulse`}
        style={{ boxShadow: selectedStyle.glow }}
      />
    </div>
  );
};

export default function TopNavbar({ onRefresh }) {
  const { range, setRange, interval, setInterval } = useDateRange();

  const handleRangeChange = (e) => setRange(e.target.value);
  const handleIntervalChange = (e) => setInterval(e.target.value);

  useEffect(() => {
    if (range === '7d' || range === '30d') setInterval('day');
    else if (range === '90d') setInterval('week');
    else setInterval('day');
  }, [range]);

  return (
    <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-900 p-4 rounded-xl shadow mb-4">
      {/* Logo and EPS Container */}
      <div className="flex items-center gap-2.5"> {/* Adjusted gap to ~4px */}
        {/* Logo */}
        <div
          className="bg-gradient-to-r from-white/10 to-white/5 rounded-full shadow-lg backdrop-blur-sm relative"
          style={{
            width: '48px',
            height: '48px',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCL2GuXkm4vnkAnNz1yA4Kxlg-jjKIOdohivr_s_uCRQ5z1gYjlSJX139c7I-iR-2i3sCVQK3kmP3_ZRvvBezy_m5eB-sX9N3cn42lJbi5PveE90jfqPt4Luc52J6nU1MTIWZGkdBzT76fTVru6Wk8RafSOcgNzPumjNLay5fUxQ_YIihCHQ7Us1_-wVMV/s400/Eagleye-S.png"
            alt="Logo"
            style={{ width: '44px', height: '44px', objectFit: 'contain' }}
          />
        </div>

        {/* Event Rate Indicator */}
        <EventRateIndicator />
      </div>

      {/* Right Side: Time Range, Interval, Refresh, and Clock */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Time Range Selector */}
        <select
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1"
          value={range}
          onChange={handleRangeChange}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="custom">Custom</option>
        </select>

        {/* Interval Selector */}
        <select
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1"
          value={interval}
          onChange={handleIntervalChange}
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded"
        >
          Refresh
        </button>

        {/* Styled Live Clock */}
        <LiveClock theme="lightBlue" />
      </div>
    </div>
  );
}