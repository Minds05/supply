import { supabase } from './supabaseClient';
import { AnalysisResult, RiskLevel } from '../types';

export interface ScanRecord {
  id: string;
  package_name: string;
  version: string;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  created_at: string;
  ecosystem: string;
}

export const saveScan = async (result: AnalysisResult, ecosystem: string) => {
  if (!supabase) {
    console.warn("Supabase not configured (SUPABASE_URL/KEY missing). Skipping DB save.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('scans')
      .insert([
        {
          package_name: result.packageName,
          version: result.version,
          risk_score: result.riskScore,
          risk_level: result.riskLevel,
          summary: result.summary,
          ecosystem: ecosystem,
          static_analysis: result.staticAnalysis,
          dynamic_analysis: result.dynamicAnalysis,
          typosquat_target: result.typosquattingTarget
        }
      ])
      .select();

    if (error) {
      console.error('Error saving scan to Supabase:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error saving scan:', err);
    return null;
  }
};

export const getReports = async (): Promise<ScanRecord[]> => {
  if (!supabase) {
    console.warn("Supabase not configured. Returning empty/mock list.");
    return [
       { 
           id: 'demo-1', 
           package_name: 'demo-package', 
           version: '1.0.0', 
           risk_score: 10, 
           risk_level: RiskLevel.LOW, 
           summary: 'Supabase not connected. This is a placeholder.', 
           created_at: new Date().toISOString(), 
           ecosystem: 'npm' 
       }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
    return data as ScanRecord[];
  } catch (err) {
    console.error('Unexpected error fetching reports:', err);
    return [];
  }
};

export const getDashboardMetrics = async () => {
  if (!supabase) {
    return {
      total: 1240,
      malicious: 85,
      alerts: [
        { package_name: 'react-dom-evil', risk_level: 'Critical', created_at: new Date().toISOString() },
        { package_name: 'lodash-vulnerable', risk_level: 'High', created_at: new Date(Date.now() - 3600000).toISOString() },
        { package_name: 'colors-fake', risk_level: 'Medium', created_at: new Date(Date.now() - 7200000).toISOString() }
      ]
    };
  }

  try {
    const { count: totalCount } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true });

    const { count: maliciousCount } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .gte('risk_score', 50);

    const { data: alerts } = await supabase
      .from('scans')
      .select('package_name, risk_level, created_at')
      .gte('risk_score', 50)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      total: totalCount || 0,
      malicious: maliciousCount || 0,
      alerts: alerts || []
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return { total: 0, malicious: 0, alerts: [] };
  }
};

export const getWeeklyChartData = async () => {
  // Returns mock data for the chart as aggregation is complex without backend logic
  return [
    { name: 'Mon', safe: 45, malicious: 2 },
    { name: 'Tue', safe: 52, malicious: 5 },
    { name: 'Wed', safe: 38, malicious: 1 },
    { name: 'Thu', safe: 65, malicious: 8 },
    { name: 'Fri', safe: 48, malicious: 3 },
    { name: 'Sat', safe: 20, malicious: 0 },
    { name: 'Sun', safe: 15, malicious: 1 },
  ];
};