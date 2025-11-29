import React from 'react';
import { LayoutDashboard, Search, ShieldAlert, Settings, FileText, Activity, Book } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scanner', icon: Search },
    { id: 'live', label: 'Live Sandbox', icon: Activity },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'guide', label: 'Guide', icon: Book },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-200 bg-white/80 backdrop-blur-xl h-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                <ShieldAlert className="w-8 h-8 text-sky-600 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-sky-200 blur-md rounded-full opacity-50 animate-pulse group-hover:bg-sky-300"></div>
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">Sentinel</span>
                <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Supply Chain Security</span>
            </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                            isActive
                            ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : ''}`} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-600 tracking-wide">ENGINE ONLINE</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">v2.5.0-rc1</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs shadow-sm">
                AI
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;