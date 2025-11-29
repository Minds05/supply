import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import LiveSandbox from './components/LiveSandbox';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Guide from './components/Guide';
import { SettingsProvider } from './context/SettingsContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'scan':
        return <Scanner />;
      case 'live':
        return <LiveSandbox />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'guide':
        return <Guide />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-200">
        <Navbar currentView={currentView} setCurrentView={setCurrentView} />
        
        <main className="relative pt-28 pb-12 px-6 min-h-screen overflow-hidden">
          {/* Dynamic Background Blobs - Light Theme */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-sky-300/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0" />
          <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-blue-200/30 rounded-full blur-[80px] pointer-events-none mix-blend-multiply z-0" />

          <div className="max-w-7xl mx-auto relative z-10 animate-fade-in">
            {renderView()}
          </div>
        </main>
      </div>
    </SettingsProvider>
  );
};

export default App;