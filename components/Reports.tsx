import React, { useEffect, useState } from 'react';
import { FileText, Download, Filter, Search, ChevronDown, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { getReports, ScanRecord } from '../services/dbService';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getReports();
      setReports(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analysis Reports</h1>
           <p className="text-slate-500 mt-1">Archive of all security scans and manual audits.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm">
             <Download className="w-4 h-4" />
             Export CSV
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors shadow-lg shadow-sky-500/20">
             <Filter className="w-4 h-4" />
             Filter
           </button>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden min-h-[400px]">
         {/* Table Toolbar */}
         <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search reports by package name or ID..." 
                 className="w-full bg-white text-slate-900 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 text-sm"
               />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
               <span>Sort by:</span>
               <button className="flex items-center gap-1 text-slate-900 font-medium hover:text-sky-600">
                  Date <ChevronDown className="w-3 h-3" />
               </button>
            </div>
         </div>

         {/* Data Table */}
         {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                <p>Retrieving secure logs from database...</p>
             </div>
         ) : reports.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                 <FileText className="w-10 h-10 opacity-20" />
                 <p>No reports found.</p>
             </div>
         ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Report ID</th>
                        <th className="px-6 py-4">Package</th>
                        <th className="px-6 py-4">Analyzed</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Risk Assessment</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                            <td className="px-6 py-4 font-mono text-slate-400 group-hover:text-sky-600 transition-colors">
                                {report.id.slice(0,8).toUpperCase()}...
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-slate-900 font-medium">{report.package_name}</span>
                                    <span className="text-xs text-slate-500">v{report.version} ({report.ecosystem})</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(report.created_at).toLocaleDateString()} <span className="text-xs opacity-50">{new Date(report.created_at).toLocaleTimeString()}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`font-mono font-bold ${report.risk_score > 50 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                    {report.risk_score}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <RiskBadge level={report.risk_level} />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-sky-600 hover:text-sky-700 p-2 hover:bg-sky-50 rounded-full transition-colors">
                                    <FileText className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
         )}
         
         {/* Pagination */}
         <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-white">
            <span>Showing recent scans</span>
            <div className="flex gap-2">
               <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600">Previous</button>
               <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600">Next</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const RiskBadge = ({ level }: { level: string }) => {
   if (level === 'Critical') {
      return (
         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Critical
         </span>
      );
   }
   if (level === 'High') {
      return (
         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3.5 h-3.5" /> High
         </span>
      );
   }
   if (level === 'Medium') {
      return (
         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium
         </span>
      );
   }
   return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
         <CheckCircle className="w-3.5 h-3.5" /> Low
      </span>
   );
}

export default Reports;