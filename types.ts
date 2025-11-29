export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface AnalysisResult {
  packageName: string;
  version: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  summary: string;
  threatImpact: string; // Detailed forensic explanation
  riskBreakdown: {
    staticScore: number;
    dynamicScore: number;
  };
  staticAnalysis: {
    findings: string[];
    suspiciousFiles: string[];
  };
  dynamicAnalysis: {
    networkActivity: string[];
    fileSystemAccess: string[];
    processSpawning: string[];
  };
  typosquattingTarget?: string; // If it looks like a typo of a popular package
}

export interface ScanHistoryItem {
  id: string;
  packageName: string;
  timestamp: Date;
  riskLevel: RiskLevel;
  riskScore: number;
}