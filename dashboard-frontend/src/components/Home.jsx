import { Link } from 'react-router-dom';

const dashboardSections = [
  {
    title: 'General Dashboards',
    dashboards: [
      { name: 'CXO Dashboard', path: '/cxo', isComplete: true },
      { name: 'Executive Summary', path: '/executive', isComplete: true },
      { name: 'Vector Dashboard', path: '/vector', isComplete: false },
      { name: 'Firewall', path: '/firewall', isComplete: true },
    ],
  },
  {
    title: 'Endpoint',
    dashboards: [
      { name: 'Windows', path: '/endpoint/windows', isComplete: false },
      { name: 'Linux', path: '/endpoint/linux', isComplete: false },
      { name: 'Mac', path: '/endpoint/mac', isComplete: false },
    ],
  },
  {
    title: 'Network',
    dashboards: [
      { name: 'PfSense', path: '/network/pfsense', isComplete: false },
      { name: 'Crowdstrike', path: '/network/crowdstrike', isComplete: false },
    ],
  },
  {
    title: 'Threat Intelligence',
    dashboards: [
      { name: 'Threat Advisory', path: 'https://threat-advisory.vercel.app/', isComplete: true },
    ],
  },
];

export default function Home() {
  return (
    <div 
      className="overflow-hidden min-h-screen bg-gray-950 text-white px-6 py-10 relative"
      style={{
        backgroundImage: `url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCL2GuXkm4vnkAnNz1yA4Kxlg-jjKIOdohivr_s_uCRQ5z1gYjlSJX139c7I-iR-2i3sCVQK3kmP3_ZRvvBezy_m5eB-sX9N3cn42lJbi5PveE90jfqPt4Luc52J6nU1MTIWZGkdBzT76fTVru6Wk8RafSOcgNzPumjNLay5fUxQ_YIihCHQ7Us1_-wVMV/s400/Eagleye-S.png')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '400px',
        backgroundBlendMode: 'soft-light',
      }}
    >
      <div className="relative z-10 ">
        <h1
          className="text-4xl font-bold text-center mb-10"
          style={{
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.5)', // Glow effect on text
            transition: 'text-shadow 0.3s ease-in-out',
          }}
          onMouseEnter={(e) => (e.target.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)')} // Hover glow
          onMouseLeave={(e) => (e.target.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.3)')} // Reset glow
        >
          EaglEye Dashboards
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dashboardSections.map(section => (
            <div key={section.title} className="bg-gray-900 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">{section.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.dashboards.map(d => (
                  <Link
                    key={d.name}
                    to={d.isComplete ? d.path : '#'}
                    className={`relative transition p-4 rounded-xl text-center font-medium border ${
                      d.isComplete
                        ? 'text-white bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10'
                        : 'text-gray-400 blur-[0.5px] opacity-60 pointer-events-none bg-gradient-to-r from-gray-700/50 to-gray-600/50'
                    } backdrop-blur-sm shadow-md hover:shadow-lg`}
                    style={{
                      boxShadow: d.isComplete
                        ? '0 0 15px rgba(255, 255, 255, 0.2)'
                        : '0 0 8px rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}