import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CXOSummary from './components/CXOSummary';
import './src/output.css';
import Home from './components/Home';
import SidebarLayout from './components/SidebarLayout';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import FirewallDashboard from './components/FirewallDashboard';
import { DateRangeProvider } from './components/DateRangeContext';

const CyberBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to fill the window
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dot properties
    const dots = [];
    const numDots = 50;
    const maxDistance = 150; // Maximum distance for connecting lines

    // Initialize dots
    for (let i = 0; i < numDots; i++) {
      dots.push({
        x: Math.random() * (canvas.width || window.innerWidth),
        y: Math.random() * (canvas.height || window.innerHeight),
        vx: (Math.random() - 0.5) * 0.5, // Velocity x
        vy: (Math.random() - 0.5) * 0.5, // Velocity y
        radius: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      if (!ctx) return; // Guard against null context
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw dots with blur
      dots.forEach(dot => {
        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        // Apply blur effect to dots
        ctx.filter = 'blur(1px)'; // Subtle blur effect

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 136, 0, 0.5)';
        ctx.fill();
        ctx.closePath();

        // Reset filter to avoid affecting other drawings
        ctx.filter = 'none';
      });

      // Draw connecting lines with blur
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dot1 = dots[i];
          const dot2 = dots[j];
          const distance = Math.sqrt((dot1.x - dot2.x) ** 2 + (dot1.y - dot2.y) ** 2);

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance; // Fade with distance

            // Apply blur effect to lines
            ctx.filter = 'blur(1px)'; // Subtle blur effect

            ctx.beginPath();
            ctx.moveTo(dot1.x, dot1.y);
            ctx.lineTo(dot2.x, dot2.y);
            ctx.strokeStyle = `rgba(235, 138, 11, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();

            // Reset filter to avoid affecting other drawings
            ctx.filter = 'none';
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0, // keep below main content, but not negative
        background: 'transparent',
        pointerEvents: 'none', // prevent interaction issues
      }}
    />
  );
};

function App() {
  return (
    <DateRangeProvider>
      <Router>
        <CyberBackground />
        <div className="min-h-screen flex flex-col bg-gray-950 text-white p-6 overflow-hidden">
          <Routes>
            <Route element={<SidebarLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/cxo" element={<CXOSummary />} />
              <Route path="/executive" element={<ExecutiveDashboard />} />
              <Route path="/firewall" element={<FirewallDashboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </DateRangeProvider>
  );
}

export default App;