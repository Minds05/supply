import React from 'react';
import { Book, Terminal, Shield, AlertTriangle, Zap, Activity } from 'lucide-react';

const Guide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-fade-in">
      <div className="text-center space-y-4 py-8">
         <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl mb-2 shadow-sm border border-slate-200">
            <Book className="w-10 h-10 text-sky-600" />
         </div>
         <h1 className="text-4xl font-bold text-slate-900 tracking-tight">User Guide & Documentation</h1>
         <p className="text-slate-500 max-w-2xl mx-auto text-lg">
           Learn how to utilize Sentinel to detect supply chain threats and navigate the live sandbox environment.
         </p>
      </div>

      {/* Section 1: Quick Start */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-4">
           <Zap className="w-6 h-6 text-amber-500" />
           Getting Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-6 rounded-xl">
              <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold mb-4">1</div>
              <h3 className="font-bold text-slate-900 mb-2">Input Package</h3>
              <p className="text-sm text-slate-500">Navigate to the <strong>Scanner</strong> tab. Select the ecosystem (npm/PyPI) and enter the exact package name you wish to audit.</p>
           </div>
           <div className="glass-card p-6 rounded-xl">
              <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold mb-4">2</div>
              <h3 className="font-bold text-slate-900 mb-2">AI Analysis</h3>
              <p className="text-sm text-slate-500">Sentinel initiates a multi-stage scan: Metadata retrieval, Static AST analysis, and Dynamic behavioral simulation.</p>
           </div>
           <div className="glass-card p-6 rounded-xl">
              <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold mb-4">3</div>
              <h3 className="font-bold text-slate-900 mb-2">Review Report</h3>
              <p className="text-sm text-slate-500">View the comprehensive risk score, breakdown of anomalies, and inspect the generated report in the <strong>Reports</strong> tab.</p>
           </div>
        </div>
      </section>

      {/* Section 2: Live Sandbox */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-4">
           <Terminal className="w-6 h-6 text-emerald-600" />
           Live Sandbox Manual
        </h2>
        <div className="glass-card p-8 rounded-xl space-y-6">
           <p className="text-slate-600">
             The <strong>Live Sandbox</strong> is an interactive terminal that simulates a secure execution environment. You can interact with it using text commands.
           </p>
           
           <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 shadow-inner">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Available Commands</h4>
              <div className="space-y-4 font-mono text-sm">
                 <div className="flex gap-4">
                    <span className="text-emerald-400 font-bold min-w-[120px]">scan &lt;pkg&gt;</span>
                    <span className="text-slate-400">Manually triggers a scan simulation for a package (e.g., <span className="text-slate-500">scan react</span>).</span>
                 </div>
                 <div className="flex gap-4">
                    <span className="text-emerald-400 font-bold min-w-[120px]">details</span>
                    <span className="text-slate-400">Displays current session statistics, memory usage, and active threat count.</span>
                 </div>
                 <div className="flex gap-4">
                    <span className="text-emerald-400 font-bold min-w-[120px]">clear</span>
                    <span className="text-slate-400">Clears the terminal output history.</span>
                 </div>
                 <div className="flex gap-4">
                    <span className="text-emerald-400 font-bold min-w-[120px]">help</span>
                    <span className="text-slate-400">Lists all available commands.</span>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg">
              <h4 className="font-bold text-sky-800 mb-1">Pro Tip</h4>
              <p className="text-sm text-sky-700">
                 The sandbox output is generated in real-time by the AI engine. If you see "Network Activity" logging connection attempts to unknown IPs, this indicates potential malware behavior (C2 communication).
              </p>
           </div>
        </div>
      </section>

      {/* Section 3: Risk Levels */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-4">
           <Shield className="w-6 h-6 text-rose-500" />
           Understanding Risk Scores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass-card p-6 rounded-xl border-l-4 border-rose-500">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-slate-900">Critical (80-100)</h3>
                 <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-sm text-slate-500">
                 Immediate threat. The package likely contains known malware signatures, obfuscated payloads, or is a confirmed typosquat of a popular library. <strong>Action: Do not install.</strong>
              </p>
           </div>

           <div className="glass-card p-6 rounded-xl border-l-4 border-orange-500">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-slate-900">High (50-79)</h3>
                 <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm text-slate-500">
                 Suspicious behavior detected. High entropy strings, unusual network calls, or install scripts accessing sensitive files. Manual audit required.
              </p>
           </div>

           <div className="glass-card p-6 rounded-xl border-l-4 border-yellow-500">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-slate-900">Medium (20-49)</h3>
                 <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-sm text-slate-500">
                 Uncommon patterns found. Might be a new package with low reputation or uses slightly non-standard coding practices. Use with caution.
              </p>
           </div>

           <div className="glass-card p-6 rounded-xl border-l-4 border-emerald-500">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-slate-900">Low (0-19)</h3>
                 <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm text-slate-500">
                 Package appears safe. Matches known good patterns, has healthy community usage (simulated), and no obvious static/dynamic anomalies.
              </p>
           </div>
        </div>
      </section>

    </div>
  );
};

export default Guide;