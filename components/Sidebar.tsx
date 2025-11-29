import React from 'react';
import { LayoutDashboard, Search, ShieldAlert, Settings, FileText, Activity } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Package Scanner', icon: Search },
    { id: 'live', label: 'Live Sandbox', icon: Activity },
    { id: 'reports', label: 'Analysis Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-64 glass-panel border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50 backdrop-blur-xl bg-slate-900/80">
      <div className="p-8 flex items-center gap-3">
        <div className="relative">
           <ShieldAlert className="w-8 h-8 text-emerald-500 relative z-10" />
           <div className="absolute inset-0 bg-emerald-500/30 blur-md rounded-full"></div>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Sentinel</span>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"></div>
              )}
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6 border-t border-slate-800/50">
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-wider">System Status</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-emerald-400 font-medium">Engine Active</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-2 font-mono">Build v2.5.0-rc1</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;