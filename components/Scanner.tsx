import React, { useState, useContext } from 'react';
import { Search, Loader2, AlertOctagon, CheckCircle2, AlertTriangle, FileCode, Network, Terminal, Shield, Zap, X, FileText, Check, Info } from 'lucide-react';
import { analyzePackage } from '../services/geminiService';
import { saveScan } from '../services/dbService';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import LiveSandbox from './LiveSandbox';
import { SettingsContext } from '../context/SettingsContext';

const Scanner: React.FC = () => {
  const [query, setQuery] = useState('');
  const [ecosystem, setEcosystem] = useState<'npm' | 'pypi'>('npm');
  const { sensitivity } = useContext(SettingsContext);
  
  // Stages: 'idle' -> 'fetching' (API) -> 'simulating' (Sandbox) -> 'complete' (Result)
  const [scanStage, setScanStage] = useState<'idle' | 'fetching' | 'simulating' | 'complete'>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [reportSaved, setReportSaved] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setScanStage('fetching');
    setResult(null);
    setReportSaved(false);

    // 1. Fetch Analysis from AI
    const data = await analyzePackage(query, ecosystem, sensitivity);
    setResult(data);
    
    // 2. Transition to Live Simulation
    setScanStage('simulating');
  };

  const handleSimulationComplete = async () => {
    // 3. Save to DB and Show Results
    if (result) {
        await saveScan(result, ecosystem);
        setReportSaved(true);
    }
    setScanStage('complete');
  };

  const resetScanner = () => {
      setQuery('');
      setScanStage('idle');
      setResult(null);
      setReportSaved(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20 min-h-[80vh] flex flex-col">
      
      {/* Header - Only show when not viewing results to keep focus */}
      {scanStage === 'idle' && (
        <div className="text-center space-y-4 py-8 animate-slide-up mt-10">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl mb-2 shadow-lg shadow-sky-100 border border-slate-100">
                <Shield className="w-10 h-10 text-sky-600" />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight">AI Package Inspector</h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Detect malicious code, typosquatting, and hidden backdoors in your dependencies before they enter your supply chain.
            </p>
        </div>
      )}

      {/* Search Input - Hide during active scan/result to focus user on data */}
      {scanStage === 'idle' && (
        <div className="glass-card p-2 rounded-2xl max-w-3xl mx-auto w-full transform transition-all hover:scale-[1.01] duration-300 animate-slide-up delay-100 shadow-xl">
            <form onSubmit={handleScan} className="flex items-center gap-2">
            <div className="relative group z-10">
                <select
                value={ecosystem}
                onChange={(e) => setEcosystem(e.target.value as 'npm' | 'pypi')}
                className="bg-slate-50 text-slate-700 pl-5 pr-10 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none appearance-none cursor-pointer font-medium hover:bg-slate-100 transition-colors"
                >
                <option value="npm">npm</option>
                <option value="pypi">PyPI</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
            
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter package name (e.g. react, lodash)..."
                className="flex-1 bg-transparent text-slate-900 px-4 py-3 outline-none placeholder:text-slate-400 text-lg font-mono"
            />
            
            <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-sky-500/30 active:scale-95 flex items-center gap-2"
            >
                <Zap className="w-5 h-5 fill-current" />
                <span>Scan</span>
            </button>
            </form>
        </div>
      )}

      {/* Stage 1: API Fetch Loading */}
      {scanStage === 'fetching' && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
           <div className="glass-panel p-10 rounded-2xl border border-sky-100 shadow-xl max-w-2xl w-full relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent animate-slide-right"></div>
              <h3 className="text-xl font-bold text-center text-slate-900 mb-8 tracking-wide">INITIALIZING SENTINEL ENGINE</h3>
              <div className="space-y-6">
                <PipelineStep label="Querying Global Package Registry..." active={true} index={0} />
                <PipelineStep label="Acquiring Source Code & Metadata..." active={true} index={1} />
                <PipelineStep label="Initializing Neural Analysis Engine..." active={true} index={2} />
              </div>
           </div>
        </div>
      )}

      {/* Stage 2: Live Sandbox Simulation */}
      {scanStage === 'simulating' && result && (
          <div className="animate-slide-up flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                   <div className="w-3 h-3 bg-sky-500 rounded-full animate-ping"></div>
                   Running Dynamic Analysis
                </h2>
                <div className="text-sm font-mono text-slate-500">Target: {result.packageName}@{result.version}</div>
              </div>
              
              <LiveSandbox 
                 analysisResult={result} 
                 onComplete={handleSimulationComplete} 
                 embedded={true}
              />
          </div>
      )}

      {/* Stage 3: Results View */}
      {scanStage === 'complete' && result && (
        <div className="space-y-6 animate-slide-up pb-10">
          {/* Top Actions */}
          <div className="flex justify-between items-center mb-4">
            <button 
                onClick={resetScanner}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group"
            >
                <div className="p-1 rounded-full bg-slate-200 group-hover:bg-slate-300">
                    <X className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">New Scan</span>
            </button>

            {reportSaved && (
                <div className="flex items-center gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 text-xs font-bold">
                        <Check className="w-3 h-3" />
                        Report Generated Successfully
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); /* Navigate would go here */ }} className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium">
                        <FileText className="w-4 h-4" /> View Report
                    </a>
                </div>
            )}
          </div>

          {/* Header Summary & Detailed Score Breakdown */}
          <div className={`glass-card rounded-2xl p-8 flex flex-col md:flex-row gap-10 items-stretch animate-slide-up ${
            result.riskLevel === 'Critical' || result.riskLevel === 'High' 
              ? 'border-rose-200 shadow-rose-100 shadow-xl' 
              : result.riskLevel === 'Medium'
              ? 'border-orange-200 shadow-orange-100 shadow-xl'
              : 'border-emerald-200 shadow-emerald-100 shadow-xl'
          }`}>
             {/* Enhanced Score Gauge with Tooltip */}
            <div className="flex flex-col items-center justify-center min-w-[200px] border-r border-slate-100 pr-8">
                <div className="relative w-48 h-48 flex-shrink-0 animate-slide-right cursor-help group">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ name: 'Risk', value: result.riskScore }, { name: 'Safe', value: 100 - result.riskScore }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={85}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={getRiskColor(result.riskScore)} />
                                <Cell fill="#f1f5f9" />
                            </Pie>
                            <RechartsTooltip 
                                active={true}
                                content={({ active }) => {
                                    if (active) {
                                        return (
                                            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-xs">
                                                <p className="font-bold text-slate-900 mb-2">Score Composition</p>
                                                <div className="flex justify-between gap-4 text-slate-500">
                                                    <span>Static Analysis:</span>
                                                    <span className="text-slate-900">{result.riskBreakdown?.staticScore || 0} pts</span>
                                                </div>
                                                <div className="flex justify-between gap-4 text-slate-500">
                                                    <span>Dynamic Sandbox:</span>
                                                    <span className="text-slate-900">{result.riskBreakdown?.dynamicScore || 0} pts</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className={`text-4xl font-bold ${getRiskTextColor(result.riskScore)}`}>{result.riskScore}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-widest mt-2 font-semibold">Total Risk</span>
                    </div>
                </div>
            </div>

            {/* Score Breakdown Bars & Summary */}
            <div className="flex-1 space-y-6 animate-slide-up delay-100 py-2">
                <div className="flex flex-wrap items-center gap-4">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{result.packageName} <span className="text-slate-400 text-xl font-normal font-mono ml-2">v{result.version}</span></h2>
                    <span className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-wide uppercase ${getRiskBadgeClass(result.riskLevel)}`}>
                        {result.riskLevel} Risk
                    </span>
                    {result.typosquattingTarget && (
                        <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-mono border border-purple-200 animate-pulse">
                            ⚠ Typosquat target: {result.typosquattingTarget}
                        </span>
                    )}
                </div>

                <p className="text-slate-600 text-lg leading-relaxed">
                    {result.summary}
                </p>

                {/* Breakdown Visualization */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-4 h-4 text-sky-600" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Risk Score Analysis</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Static Score Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Static Code Analysis</span>
                                <span className="text-slate-900 font-mono">{result.riskBreakdown?.staticScore || 0}/50</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                                    style={{ width: `${((result.riskBreakdown?.staticScore || 0) / 50) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-slate-400">Based on AST parsing, metadata anomalies, and signature matching.</p>
                        </div>

                        {/* Dynamic Score Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Dynamic Sandbox Behavior</span>
                                <span className="text-slate-900 font-mono">{result.riskBreakdown?.dynamicScore || 0}/50</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                                    style={{ width: `${((result.riskBreakdown?.dynamicScore || 0) / 50) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-slate-400">Based on runtime network traffic, filesystem access, and system calls.</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Static Analysis */}
            <div className="glass-card rounded-xl p-6 animate-slide-up delay-200 hover:border-sky-200 transition-colors">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Static Analysis</h3>
                  <p className="text-xs text-slate-400 font-mono">AST PARSING & METADATA</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detected Anomalies</h4>
                  <ul className="space-y-3">
                    {result.staticAnalysis.findings.length > 0 ? (
                      result.staticAnalysis.findings.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm group">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center gap-3 text-emerald-600 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>No static anomalies detected.</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                {result.staticAnalysis.suspiciousFiles.length > 0 && (
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suspicious Files</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.staticAnalysis.suspiciousFiles.map((file, idx) => (
                          <span key={idx} className="bg-white text-slate-600 px-2 py-1 rounded text-xs font-mono border border-slate-200 flex items-center gap-1 shadow-sm">
                            <FileCode className="w-3 h-3 text-slate-400" />
                            {file}
                          </span>
                        ))}
                      </div>
                   </div>
                )}
              </div>
            </div>

            {/* Dynamic Analysis Summary (Post-Sandbox) */}
            <div className="glass-card rounded-xl p-6 animate-slide-up delay-300 hover:border-sky-200 transition-colors">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Dynamic Sandbox Report</h3>
                  <p className="text-xs text-slate-400 font-mono">RUNTIME BEHAVIOR LOG</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <Network className="w-3 h-3" /> Network Telemetry
                  </h4>
                  {result.dynamicAnalysis.networkActivity.length > 0 ? (
                    <ul className="space-y-2">
                       {result.dynamicAnalysis.networkActivity.map((net, idx) => (
                        <li key={idx} className="text-xs text-cyan-700 font-mono bg-cyan-50 p-2.5 rounded border border-cyan-100 block shadow-sm">
                          {'>'} {net}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic pl-5">No suspicious network traffic observed.</p>
                  )}
                </div>

                <div>
                   <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <AlertOctagon className="w-3 h-3" /> Process & Syscalls
                  </h4>
                  {result.dynamicAnalysis.processSpawning.length > 0 ? (
                     <ul className="space-y-2">
                     {result.dynamicAnalysis.processSpawning.map((proc, idx) => (
                      <li key={idx} className="text-xs text-rose-700 font-mono bg-rose-50 p-2.5 rounded border border-rose-100 block shadow-sm">
                        {'>'} {proc}
                      </li>
                    ))}
                  </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic pl-5">No unauthorized process spawning detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PipelineStep = ({ label, active, index }: { label: string, active: boolean, index: number }) => {
  return (
    <div className={`flex items-center gap-4 text-slate-500 ${active ? 'opacity-100' : 'opacity-30'} transition-opacity duration-500`} style={{ animationDelay: `${index * 500}ms`}}>
      <div className="relative">
         <div className="w-8 h-8 rounded-full border-2 border-sky-200 flex items-center justify-center bg-white">
             <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></div>
         </div>
         <div className="absolute top-8 left-1/2 w-0.5 h-6 bg-slate-200 -translate-x-1/2"></div>
      </div>
      <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
        <span className="font-mono text-sm">{label}</span>
        <span className="text-xs text-sky-600 font-mono animate-pulse">PROCESSING</span>
      </div>
    </div>
  );
};

const getRiskColor = (score: number) => {
  if (score >= 80) return '#f43f5e'; // Rose 500
  if (score >= 50) return '#f97316'; // Orange 500
  return '#10b981'; // Emerald 500
};

const getRiskTextColor = (score: number) => {
  if (score >= 80) return 'text-rose-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-emerald-600';
};

const getRiskBadgeClass = (level: string) => {
  switch (level) {
    case 'Critical': return 'bg-rose-100 text-rose-700 border border-rose-200';
    case 'High': return 'bg-orange-100 text-orange-700 border border-orange-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    default: return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  }
};

export default Scanner;