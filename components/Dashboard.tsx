import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShieldCheck, AlertTriangle, Package, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getDashboardMetrics, getWeeklyChartData } from '../services/dbService';

const initialAnomalyData = [
  { time: '00:00', score: 10 },
  { time: '04:00', score: 15 },
  { time: '08:00', score: 45 },
  { time: '12:00', score: 80 }, 
  { time: '16:00', score: 25 },
  { time: '20:00', score: 15 },
];

const Dashboard: React.FC = () => {
  const [anomalyData, setAnomalyData] = useState(initialAnomalyData);
  const [metrics, setMetrics] = useState({ total: 0, malicious: 0, alerts: [] as any[] });
  const [chartData, setChartData] = useState<any[]>([]);

  // Load Real Data
  useEffect(() => {
    const fetchData = async () => {
        const m = await getDashboardMetrics();
        setMetrics(m);
        const c = await getWeeklyChartData();
        setChartData(c);
    };
    fetchData();

    // Refresh metrics every 30s
    const metricsInterval = setInterval(fetchData, 30000);
    return () => clearInterval(metricsInterval);
  }, []);

  // Simulate live anomaly updates (Visual effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnomalyData(prev => {
        const newData = [...prev.slice(1)];
        const lastTime = parseInt(prev[prev.length - 1].time.split(':')[0]);
        const newTime = `${(lastTime + 4) % 24}:00`.padStart(5, '0');
        const baseScore = Math.floor(Math.random() * 50) + 10;
        const isSpike = Math.random() > 0.8;
        const newScore = isSpike ? baseScore + 40 : baseScore;
        
        newData.push({ time: newTime, score: newScore });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <header className="animate-slide-up">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Overview</h1>
        <p className="text-slate-500 mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Real-time threat intelligence active
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Packages Scanned" 
          value={metrics.total.toLocaleString()} 
          change="+12%" 
          trend="up"
          icon={Package} 
          color="blue" 
          delay="delay-100"
        />
        <StatCard 
          title="Malicious Detected" 
          value={metrics.malicious.toLocaleString()} 
          change="+2.4%" 
          trend="up"
          icon={AlertTriangle} 
          color="rose" 
          delay="delay-200"
        />
        <StatCard 
          title="Supply Chain Safe" 
          value={metrics.total > 0 ? `${((1 - metrics.malicious/metrics.total) * 100).toFixed(1)}%` : '100%'} 
          change="-0.1%" 
          trend="down"
          icon={ShieldCheck} 
          color="emerald" 
          delay="delay-300"
        />
        <StatCard 
          title="Active Monitoring" 
          value="24/7" 
          change="Live" 
          trend="neutral"
          icon={Activity} 
          color="violet" 
          delay="delay-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Activity Chart */}
        <div className="glass-card rounded-xl p-6 animate-slide-up delay-200">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Scan Volume vs Threats</h3>
             <button className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-md text-slate-600 transition-colors">Last 7 Days</button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="safe" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} name="Safe Packages" animationDuration={1500} />
                <Bar dataKey="malicious" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Malicious" animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Detection Stream */}
        <div className="glass-card rounded-xl p-6 animate-slide-up delay-300 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Risk Trend
            </h3>
            <span className="text-xs font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">HEURISTIC-ENGINE-A</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={anomalyData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" isAnimationActive={true} animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="glass-card rounded-xl overflow-hidden animate-slide-up delay-400">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-lg font-bold text-slate-800">Recent Security Alerts</h3>
          <button className="text-sm text-sky-600 hover:text-sky-700 font-medium">View All Alerts</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.alerts.length > 0 ? (
                metrics.alerts.map((alert: any, idx: number) => (
                    <AlertRow 
                        key={idx} 
                        package={alert.package_name} 
                        level={alert.risk_level} 
                        time={new Date(alert.created_at).toLocaleTimeString()} 
                    />
                ))
              ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No recent critical alerts. System secure.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, trend, icon: Icon, color, delay }: any) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  const trendColor = trend === 'up' && color === 'rose' ? 'text-rose-600' 
                   : trend === 'up' ? 'text-emerald-600'
                   : trend === 'down' && color === 'emerald' ? 'text-rose-600'
                   : 'text-slate-500';

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;

  return (
    <div className={`glass-card p-6 rounded-xl animate-slide-up ${delay}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 tracking-wide">{title}</p>
          <h4 className="text-3xl font-bold text-slate-900 mt-2 font-mono tracking-tighter">{value}</h4>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span className={`flex items-center gap-1 font-bold ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {change}
        </span>
        <span className="text-slate-400 ml-2">vs last week</span>
      </div>
    </div>
  );
};

const AlertRow = ({ package: pkg, level, time }: any) => {
    const levelStyles = level === 'Critical' ? 'text-rose-700 bg-rose-50 border-rose-100' : 
                       level === 'High' ? 'text-orange-700 bg-orange-50 border-orange-100' : 'text-yellow-700 bg-yellow-50 border-yellow-100';
  return (
    <tr className="hover:bg-slate-50/80 transition-colors duration-200">
      <td className="px-6 py-4 font-bold text-slate-800 font-mono text-sm">{pkg}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${levelStyles} uppercase tracking-wider`}>
          {level}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-500">{time}</td>
      <td className="px-6 py-4">
        <button className="text-sky-600 hover:text-sky-700 hover:underline underline-offset-4 font-medium text-xs uppercase tracking-wide">Review</button>
      </td>
    </tr>
  );
};

export default Dashboard;