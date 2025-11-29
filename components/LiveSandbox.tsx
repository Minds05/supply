import React, { useState, useEffect, useRef, useContext } from 'react';
import { Terminal, Shield, Play, Pause, RefreshCw, Cpu, Wifi, AlertTriangle, ChevronRight } from 'lucide-react';
import { AnalysisResult } from '../types';
import { analyzePackage } from '../services/geminiService';
import { SettingsContext } from '../context/SettingsContext';

interface LiveSandboxProps {
  analysisResult?: AnalysisResult | null;
  onComplete?: () => void;
  embedded?: boolean;
}

interface LogEntry {
  type: 'info' | 'sys' | 'net' | 'warn' | 'crit' | 'cmd' | 'ai';
  msg: string;
  delay?: number;
}

const defaultLogs: LogEntry[] = [
  { type: 'info', msg: 'Initializing secure sandbox environment (Isolation Level 3)...' },
  { type: 'sys', msg: '[KERNEL] Mounting virtual filesystem /mnt/sandbox_root' },
  { type: 'sys', msg: '[KERNEL] Allocating memory pages: 0x00400000 - 0x00800000' },
  { type: 'net', msg: '[NET-INT] Network interface eth0 up. Promiscuous mode ENABLED.' },
  { type: 'info', msg: 'System Ready. Waiting for input...' },
];

const LiveSandbox: React.FC<LiveSandboxProps> = ({ analysisResult, onComplete, embedded = false }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const timeoutRefs = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { sensitivity } = useContext(SettingsContext);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const focusInput = () => {
    if (!embedded) inputRef.current?.focus();
  };

  const runSimulationSequence = (result: AnalysisResult, isManual: boolean = false) => {
    setIsRunning(true);
    setCurrentAnalysis(result);
    
    const sequence: LogEntry[] = [];
    let currentTime = 0;

    const addLog = (type: LogEntry['type'], msg: string, duration: number) => {
        sequence.push({ type, msg, delay: currentTime });
        currentTime += duration;
    };

    if (isManual) {
        addLog('ai', `[AI-INTEL] Connection established to Neural Engine.`, 200);
        addLog('ai', `[AI-INTEL] Retrieving package manifest for: ${result.packageName}`, 400);
        addLog('ai', `[AI-INTEL] Analyzing dependency tree and maintainer reputation...`, 600);
        addLog('ai', `[AI-INTEL] Heuristic Analysis Complete. Risk Assessment: ${result.riskLevel.toUpperCase()}`, 800);
        addLog('info', `------------------------------------------------------------`, 1000);
        
        addLog('sys', `[VM-BOOT] Spawning isolated container (PID: ${Math.floor(Math.random() * 9000) + 1000})...`, 1200);
        addLog('sys', `[VM-KERNEL] Mounting ephemeral filesystem...`, 1500);
    } else {
        addLog('info', `Initializing Sandbox for ${result.packageName}...`, 0);
        addLog('sys', '[VM-BOOT] Container spun up. ID: 8f4a2b1c', 400);
        addLog('info', `Installing ${result.packageName}@${result.version} via npm...`, 800);
    }

    addLog('sys', '[PKG-MGR] Unpacking package tarball...', 600);
    addLog('sys', '[PKG-MGR] Executing preinstall/postinstall scripts...', 800);

    if (result.staticAnalysis.findings.length > 0) {
       result.staticAnalysis.findings.slice(0, 2).forEach(finding => {
          addLog('warn', `[STATIC-SCAN] Anomaly Detected: ${finding}`, 800);
       });
    }

    if (result.dynamicAnalysis.networkActivity.length > 0) {
      result.dynamicAnalysis.networkActivity.forEach((net) => {
        addLog('net', `[NET-OUT] ${net}`, 600);
      });
    } else {
        addLog('info', '[NET-MON] No suspicious network traffic observed.', 600);
    }

    if (result.dynamicAnalysis.fileSystemAccess.length > 0) {
       result.dynamicAnalysis.fileSystemAccess.forEach((file) => {
        addLog('sys', `[FS-ACCESS] ${file}`, 600);
      });
    }

    if (result.dynamicAnalysis.processSpawning.length > 0) {
        result.dynamicAnalysis.processSpawning.forEach((proc) => {
         addLog('crit', `[PROC-SPAWN] ${proc}`, 600);
       });
     }

    if (result.riskScore >= 80) {
      addLog('crit', `[SECURITY-ALERT] CRITICAL THREAT DETECTED. Risk Score: ${result.riskScore}`, 800);
    } else if (result.riskScore >= 50) {
      addLog('warn', `[SECURITY-WARN] Suspicious behavior flagged. Risk Score: ${result.riskScore}`, 800);
    } else {
      addLog('info', `[SECURITY-INFO] Analysis complete. Package appears safe. Risk: ${result.riskScore}`, 800);
    }

    if (isManual) {
        addLog('info', `------------------------------------------------------------`, 1000);
        addLog('info', `SESSION SUMMARY: ${result.packageName.toUpperCase()}`, 100);
        addLog('info', `> Risk Level: ${result.riskLevel} (${result.riskScore}/100)`, 100);
        addLog('info', `> Static Issues: ${result.staticAnalysis.findings.length} | Dynamic Events: ${result.dynamicAnalysis.networkActivity.length + result.dynamicAnalysis.processSpawning.length}`, 100);
        addLog('cmd', `> Type 'anomalies' for detailed findings or 'impact' for forensic analysis.`, 100);
    }

    if (!isManual) {
        addLog('info', 'Generating final report...', 800);
    }

    sequence.forEach(log => {
      const timeoutId = window.setTimeout(() => {
        setLogs(prev => [...prev, log].slice(-50));
        
        if (log === sequence[sequence.length - 1] && onComplete && !isManual) {
            setTimeout(onComplete, 800);
        }
        
        if (log === sequence[sequence.length - 1] && isManual) {
             setIsRunning(false);
        }

      }, log.delay);
      timeoutRefs.current.push(timeoutId);
    });
  };

  const performManualScan = async (pkgName: string) => {
     setLogs(prev => [...prev, { type: 'info', msg: `[SYSTEM] Initiating manual scan request for: '${pkgName}'` } as LogEntry].slice(-50));
     
     try {
         const result = await analyzePackage(pkgName, 'npm', sensitivity);
         setCurrentAnalysis(result);
         runSimulationSequence(result, true);
     } catch (error) {
         setLogs(prev => [...prev, { type: 'crit', msg: '[ERROR] Connection to Sentinel Neural Engine failed.' } as LogEntry].slice(-50));
         setIsRunning(false);
     }
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const cmd = inputVal.trim();
    setLogs(prev => [...prev, { type: 'cmd', msg: cmd } as LogEntry].slice(-50));
    setInputVal('');

    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();

    if (mainCmd === 'help') {
        setTimeout(() => {
            setLogs(prev => [...prev, { type: 'info', msg: 'Available commands: scan <pkg>, details, anomalies, impact, clear' } as LogEntry].slice(-50));
        }, 100);
    } else if (mainCmd === 'clear') {
        setLogs([]);
    } else if (mainCmd === 'scan') {
        if (args[1]) {
           setIsRunning(true);
           performManualScan(args[1]);
        } else {
            setLogs(prev => [...prev, { type: 'warn', msg: 'Usage: scan <package_name>' } as LogEntry].slice(-50));
        }
    } else if (mainCmd === 'details') {
         setLogs(prev => [...prev, 
            { type: 'info', msg: '--- SESSION TELEMETRY ---' } as LogEntry,
            { type: 'info', msg: `Uptime: ${(performance.now() / 1000 / 60).toFixed(2)}m` } as LogEntry,
            { type: 'info', msg: `Target Package: ${currentAnalysis?.packageName || 'N/A'}` } as LogEntry,
            { type: 'info', msg: `Isolation Level: Ring-0` } as LogEntry,
            { type: 'info', msg: 'Memory: 430MB / 1024MB (Stable)' } as LogEntry
         ].slice(-50));
    } else if (mainCmd === 'anomalies') {
        if (!currentAnalysis) {
            setLogs(prev => [...prev, { type: 'warn', msg: 'No active analysis found. Run "scan <pkg>" first.' } as LogEntry].slice(-50));
        } else {
             setLogs(prev => [...prev, { type: 'info', msg: `--- DETECTED ANOMALIES [${currentAnalysis.packageName.toUpperCase()}] ---` } as LogEntry].slice(-50));
             
             if (currentAnalysis.staticAnalysis.findings.length === 0 && currentAnalysis.dynamicAnalysis.networkActivity.length === 0) {
                 setLogs(prev => [...prev, { type: 'info', msg: '>> System Integrity Verified. No significant anomalies.' } as LogEntry].slice(-50));
             }

             currentAnalysis.staticAnalysis.findings.forEach(f => {
                 setLogs(prev => [...prev, { type: 'warn', msg: `[STATIC] ${f}` } as LogEntry].slice(-50));
             });
             currentAnalysis.staticAnalysis.suspiciousFiles.forEach(f => {
                 setLogs(prev => [...prev, { type: 'warn', msg: `[FILE] Suspicious payload: ${f}` } as LogEntry].slice(-50));
             });
             currentAnalysis.dynamicAnalysis.networkActivity.forEach(n => {
                 setLogs(prev => [...prev, { type: 'crit', msg: `[NET] Unauthorized connection: ${n}` } as LogEntry].slice(-50));
             });
             currentAnalysis.dynamicAnalysis.fileSystemAccess.forEach(s => {
                 setLogs(prev => [...prev, { type: 'crit', msg: `[SYS] Sensitive file access: ${s}` } as LogEntry].slice(-50));
             });
        }
    } else if (mainCmd === 'impact') {
         if (!currentAnalysis) {
            setLogs(prev => [...prev, { type: 'warn', msg: 'No active analysis found. Run "scan <pkg>" first.' } as LogEntry].slice(-50));
         } else {
             setLogs(prev => [...prev, 
                 { type: 'info', msg: '--- THREAT FORENSICS REPORT ---' } as LogEntry,
                 { type: 'info', msg: `SUBJECT: ${currentAnalysis.packageName}` } as LogEntry,
                 { type: 'info', msg: `VERDICT: ${currentAnalysis.riskLevel.toUpperCase()}` } as LogEntry,
                 { type: 'info', msg: '------------------------------' } as LogEntry,
                 { type: 'info', msg: currentAnalysis.threatImpact } as LogEntry,
                 { type: 'info', msg: '------------------------------' } as LogEntry
             ].slice(-50));
         }
    } else {
         setLogs(prev => [...prev, { type: 'warn', msg: `Command not found: ${mainCmd}` } as LogEntry].slice(-50));
    }
  };

  useEffect(() => {
      return () => {
        timeoutRefs.current.forEach(id => clearTimeout(id));
      };
  }, []);

  useEffect(() => {
    if (!analysisResult && logs.length === 0) {
       setLogs(defaultLogs);
    }
  }, []);

  useEffect(() => {
    if (!analysisResult) return;
    setLogs([]); 
    runSimulationSequence(analysisResult, false);
  }, [analysisResult]); 


  const getLogColor = (type: string) => {
    switch(type) {
      case 'info': return 'text-slate-400';
      case 'sys': return 'text-blue-400';
      case 'net': return 'text-cyan-400';
      case 'warn': return 'text-orange-400';
      case 'crit': return 'text-rose-500 font-bold';
      case 'cmd': return 'text-emerald-400 font-bold';
      case 'ai': return 'text-violet-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className={`space-y-6 animate-fade-in ${embedded ? '' : 'max-w-6xl mx-auto'}`}>
      {!embedded && (
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <ActivityIndicator active={isRunning} />
              Live Sandbox Monitor
            </h1>
            <p className="text-slate-500 mt-1 ml-7">Real-time execution analysis of suspicious packages. Type 'help' for commands.</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              disabled={!!analysisResult}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'} disabled:opacity-50 disabled:cursor-not-allowed border border-transparent`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button 
              onClick={() => { setLogs([]); }}
              disabled={!!analysisResult}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </header>
      )}

      {embedded && (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-rose-500 rounded-full relative"></div>
                </div>
                <span className="font-bold text-slate-900 tracking-wide">LIVE EXECUTION ENVIRONMENT</span>
            </div>
            <span className="text-xs font-mono text-slate-400">SESSION_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${embedded ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        {/* Main Terminal Window */}
        <div className={`${embedded ? 'h-[400px]' : 'lg:col-span-2 h-[600px]'} bg-[#0d1117] rounded-xl border border-slate-300 shadow-xl flex flex-col overflow-hidden relative group transition-all duration-500`}>
           <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-2">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
             </div>
             <span className="text-xs text-slate-400 font-mono ml-3 flex items-center gap-1">
               <Shield className="w-3 h-3" />
               sentinel-sandbox-env-04 [Root]
             </span>
           </div>

           <div 
             className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-2 relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent cursor-text text-slate-300"
             onClick={focusInput}
           >
              {logs.map((log, idx) => (
                <div key={idx} className={`flex gap-3 ${getLogColor(log.type)} animate-slide-right`}>
                  {log.type !== 'cmd' && (
                      <span className="opacity-50 min-w-[50px] text-[10px] pt-0.5 select-none">{new Date().toLocaleTimeString()}</span>
                  )}
                  {log.type === 'cmd' && (
                      <span className="opacity-80 min-w-[20px] text-emerald-500 font-bold select-none">{'>'}</span>
                  )}
                  <span className="break-all">
                     {log.type !== 'cmd' && (
                        <span className="uppercase text-[10px] border border-current rounded px-1 mr-2 opacity-70 select-none">{log.type}</span>
                     )}
                     {log.msg}
                  </span>
                </div>
              ))}
              
              {!embedded && (
                <form onSubmit={handleCommand} className="flex gap-3 items-center mt-2">
                    <span className="text-emerald-500 font-bold select-none">{'>'}</span>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        className="bg-transparent border-none outline-none text-white flex-1 font-mono text-sm"
                        autoFocus
                        spellCheck={false}
                    />
                    <div className="w-2 h-4 bg-emerald-500/50 animate-pulse"></div>
                </form>
              )}
              
              <div ref={logEndRef} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none mix-blend-overlay" style={{ backgroundSize: '100% 4px' }}></div>
           </div>
        </div>

        {!embedded && (
            <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-sky-600" /> System Resources
                </h3>
                
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>CPU Usage</span>
                        <span>12%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 w-[12%] animate-pulse"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Memory Allocation</span>
                        <span>540MB / 2GB</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 w-[25%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-cyan-600" /> Network Filter
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-xs font-mono text-emerald-600">ALLOW npm.registry</span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-xs font-mono text-emerald-600">ALLOW pypi.org</span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-xs font-mono text-rose-600">BLOCK * (Unknown)</span>
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
               <p className="mb-2 font-bold uppercase">Quick Tips:</p>
               <ul className="space-y-1 list-disc pl-4">
                  <li>Type <code className="text-slate-800 font-bold">scan &lt;name&gt;</code> to analyze</li>
                  <li>Type <code className="text-slate-800 font-bold">anomalies</code> to list threats</li>
                  <li>Type <code className="text-slate-800 font-bold">impact</code> for forensics</li>
               </ul>
            </div>

            </div>
        )}
      </div>
    </div>
  );
};

const ActivityIndicator = ({ active }: { active: boolean }) => (
   <div className={`w-3 h-3 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}>
     {active && <div className="absolute w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>}
   </div>
);

export default LiveSandbox;