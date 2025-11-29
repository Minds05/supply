import React, { useState, useContext, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Zap, Sliders, Save, Check } from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';

const Settings: React.FC = () => {
  const { sensitivity, timeout, notifications, autoRemove, updateSettings } = useContext(SettingsContext);
  
  const [localSensitivity, setLocalSensitivity] = useState(sensitivity);
  const [localTimeout, setLocalTimeout] = useState(timeout);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [localAutoRemove, setLocalAutoRemove] = useState(autoRemove);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalSensitivity(sensitivity);
    setLocalTimeout(timeout);
    setLocalNotifications(notifications);
    setLocalAutoRemove(autoRemove);
  }, [sensitivity, timeout, notifications, autoRemove]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings({
        sensitivity: localSensitivity,
        timeout: localTimeout,
        notifications: localNotifications,
        autoRemove: localAutoRemove
      });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-400" />
          System Configuration
        </h1>
        <p className="text-slate-500">Manage security policies and engine parameters.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Detection Engine Settings */}
        <div className="glass-card rounded-xl p-8 space-y-6">
           <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                 <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Detection Engine</h3>
           </div>

           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <div>
                    <label className="text-slate-900 font-medium block">Scanner Sensitivity</label>
                    <p className="text-sm text-slate-500">Adjust the heuristic threshold for malicious flagging.</p>
                 </div>
                 <select 
                   value={localSensitivity}
                   onChange={(e) => setLocalSensitivity(e.target.value)}
                   className="bg-white border border-slate-300 text-slate-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none shadow-sm"
                 >
                    <option value="standard">Standard (Balanced)</option>
                    <option value="aggressive">Aggressive (More false positives)</option>
                    <option value="paranoid">Paranoid (Zero Trust)</option>
                 </select>
              </div>

              <div className="flex justify-between items-center">
                 <div>
                    <label className="text-slate-900 font-medium block">Sandbox Timeout</label>
                    <p className="text-sm text-slate-500">Maximum duration for dynamic behavior analysis.</p>
                 </div>
                 <div className="flex gap-2">
                    {['30s', '60s', '120s'].map((opt) => (
                       <button 
                         key={opt}
                         onClick={() => setLocalTimeout(opt)}
                         className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${localTimeout === opt ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                       >
                         {opt}
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Notifications & Automation */}
        <div className="glass-card rounded-xl p-8 space-y-6">
           <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                 <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Automation & Alerts</h3>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <div>
                        <label className="text-slate-900 font-medium block">Real-time Notifications</label>
                        <p className="text-sm text-slate-500">Receive desktop alerts for critical threats found.</p>
                    </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={localNotifications} onChange={(e) => setLocalNotifications(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                 </label>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Sliders className="w-5 h-5 text-slate-400" />
                    <div>
                        <label className="text-slate-900 font-medium block">Auto-Block Malicious Packages</label>
                        <p className="text-sm text-slate-500">Automatically add detected packages to deny list.</p>
                    </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={localAutoRemove} onChange={(e) => setLocalAutoRemove(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                 </label>
              </div>
           </div>
        </div>

        <div className="flex justify-end pt-4 items-center gap-4">
           {showSuccess && (
             <span className="text-emerald-600 text-sm font-bold animate-fade-in flex items-center gap-2">
               <Check className="w-4 h-4" /> Configuration Saved
             </span>
           )}
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
           >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Configuration'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;