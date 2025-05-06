import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';


const navLinks = [
    { title: 'Home', path: '/', isComplete: true },
    { title: 'Vector Dashboard', path: '/vector', isComplete: false },
    { title: 'CXO Dashboard', path: '/cxo', isComplete: true },
    { title: 'Executive Summary', path: '/executive', isComplete: true },
    { title: 'Firewall', path: '/firewall', isComplete: true },
    {
        title: 'Endpoint',
        isComplete: true,
        children: [
            { title: 'Windows', path: '/endpoint/windows', isComplete: false },
            { title: 'Linux', path: '/endpoint/linux', isComplete: false },
            { title: 'Mac', path: '/endpoint/mac', isComplete: false },
        ]
    },
    {
        title: 'Network',
        isComplete: true,
        children: [
            { title: 'PfSense', path: '/network/pfsense', isComplete: false },
            { title: 'Crowdstrike', path: '/network/crowdstrike', isComplete: false },
        ]
    },
    {
        title: 'Threat Intelligence',
        isComplete: true,
        children: [
            { title: 'Threat Advisory', path: 'https://threat-advisory.vercel.app/', isComplete: true },
        ]
    }
];

export default function SidebarLayout() {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-950 text-white overflow-hidden">
            {/* Sidebar */}
            <div className={`overflow-hidden transition-all duration-300 bg-gray-950 shadow-lg ${collapsed ? 'w-0' : 'w-48'} p-4`}>
                <div className="flex justify-between items-center mb-6">
                    {!collapsed && (
                        <div className="flex items-center gap-2 flex-shrink-0">
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
                            {/* <span className="text-lg font-bold truncate">Dashboards</span> */}
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`z-50 absolute top-10 ${collapsed ? 'left-4' : 'left-44'} p-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white text-xl transition-all duration-300 border border-transparent hover:border-white focus:outline-none focus:ring-0`}
                    >
                        {collapsed ? '☰' : '☰'}
                    </button>
                </div>

                <nav className="space-y-3">
                    {navLinks.map((item, index) => (
                        <div key={index}>
                            <Link
                                to={item.isComplete ? (item.path || '#') : '#'}
                                className={`block px-2 py-1.5 rounded text-sm font-medium transition-all duration-300 ${item.isComplete
                                    ? 'hover:bg-gray-800 text-white'
                                    : 'pointer-events-none'
                                    }`}
                            >
                                {!collapsed && (
                                    <span
                                        className={`relative ${item.isComplete
                                            ? 'text-white'
                                            : 'text-gray-400 opacity-60 blur-[0.5px]'
                                            }`}
                                    >
                                        {item.title}
                                    </span>
                                )}
                            </Link>

                            {!collapsed && item.children && (
                                <div className="ml-3 space-y-1 mt-1">
                                    {item.children.map((child, idx) => (
                                        <Link
                                            key={idx}
                                            to={child.isComplete ? child.path : '#'}
                                            className={`block px-2 py-1.5 text-xs transition-all duration-300 ${child.isComplete
                                                ? 'hover:bg-gray-800 text-white'
                                                : 'pointer-events-none text-gray-400 opacity-60'
                                                }`}
                                        >
                                            <span className={`text-sm ${child.isComplete ? 'text-white' : 'text-gray-400 opacity-60 blur-[1px]'}`}>
                                                •
                                            </span>
                                            <span className={`ml-1 ${child.isComplete ? 'text-gray-400' : 'text-gray-400 opacity-60 blur-[0.5px]'}`}>
                                                {child.title}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Main content */}
            <main className="flex-1 p-6 overflow-y-auto overflow-hidden">
                <TopNavbar
                    onDateChange={(range) => {
                        // Optional: store in global state or context if needed
                        console.log("Selected range:", range);
                    }}
                    onRefresh={() => {
                        window.dispatchEvent(new Event("manual-refresh"));
                    }}
                />
                <div className="mt-4">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}