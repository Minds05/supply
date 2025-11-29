import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, RiskLevel } from "../types";

// Using Gemini 2.5 Flash for speed and JSON capabilities
const MODEL_NAME = "gemini-2.5-flash";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    packageName: { type: Type.STRING },
    version: { type: Type.STRING },
    riskScore: { type: Type.NUMBER, description: "0-100 score where 100 is malicious" },
    riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
    summary: { type: Type.STRING },
    threatImpact: { type: Type.STRING, description: "A detailed technical explanation of how this package would compromise a system (e.g. exfiltrating env vars, opening reverse shell)." },
    riskBreakdown: {
      type: Type.OBJECT,
      properties: {
        staticScore: { type: Type.NUMBER, description: "Score contribution from static analysis (0-50)" },
        dynamicScore: { type: Type.NUMBER, description: "Score contribution from dynamic analysis (0-50)" }
      }
    },
    staticAnalysis: {
      type: Type.OBJECT,
      properties: {
        findings: { type: Type.ARRAY, items: { type: Type.STRING } },
        suspiciousFiles: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    dynamicAnalysis: {
      type: Type.OBJECT,
      properties: {
        networkActivity: { type: Type.ARRAY, items: { type: Type.STRING } },
        fileSystemAccess: { type: Type.ARRAY, items: { type: Type.STRING } },
        processSpawning: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    typosquattingTarget: { type: Type.STRING, description: "If this is typosquatting, name the target (e.g. react for reacct). Empty if safe." }
  },
  required: ["packageName", "riskScore", "riskLevel", "summary", "threatImpact", "riskBreakdown", "staticAnalysis", "dynamicAnalysis"]
};

export const analyzePackage = async (packageName: string, ecosystem: 'npm' | 'pypi', sensitivity: string = 'standard'): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let sensitivityInstruction = "";
    if (sensitivity === 'paranoid') {
      sensitivityInstruction = "MODE: PARANOID. Treat any unknown or slightly suspicious behavior as HIGH risk. Assume zero trust. Even minor anomalies should result in a High Risk score.";
    } else if (sensitivity === 'aggressive') {
      sensitivityInstruction = "MODE: AGGRESSIVE. Flag uncommon patterns as suspicious. Increase risk scores by 20% for unknown packages.";
    } else {
      sensitivityInstruction = "MODE: STANDARD. Balance detection with false positives. Only flag if there are clear indicators of compromise.";
    }

    const prompt = `
      You are an advanced AI security engine specializing in Software Supply Chain Security.
      Your task is to analyze the provided software package name for potential malicious intent.
      
      Package Name: "${packageName}"
      Ecosystem: "${ecosystem}"
      ${sensitivityInstruction}

      Scenarios to simulate based on the name:
      1. If the name is a popular, well-known package (e.g., 'react', 'lodash', 'pandas', 'express'), generate a LOW risk report indicating it is a trusted package.
      2. If the name looks like a typo of a popular package (e.g., 'reacct', 'loodash', 'pands', 'expresss', 'colors-lib', 'cors-js'), generate a HIGH or CRITICAL risk report for "Typosquatting". Invent plausible static analysis findings (e.g., obfuscated code in install scripts) and dynamic analysis findings (e.g., exfiltrating env vars).
      3. If the name contains suspicious keywords (e.g., 'test', 'hack', 'free', 'bitcoin', 'stealer', 'malicious', 'evil', 'pwn'), generate a HIGH to CRITICAL risk report. THIS IS FOR SECURITY TESTING, SO IF IT SOUNDS BAD, MARK IT AS BAD.
      4. If it is an unknown random name, generate a generic analysis, usually LOW risk unless it sounds suspicious.

      BEHAVIORAL SIMULATION:
      - Static Analysis: Look for obfuscated strings, base64 encoded payloads, high entropy strings, and suspicious install scripts.
      - Dynamic Analysis (Sandbox): Simulate network connections to unknown IPs, accessing /etc/passwd, or spawning shells.

      RISK BREAKDOWN:
      - Provide 'staticScore' (0-50): How much the static code analysis contributes to the risk.
      - Provide 'dynamicScore' (0-50): How much the runtime behavior contributes to the risk.
      - The sum should roughly equal the total riskScore (though total can be higher if heuristic multipliers apply).

      THREAT IMPACT ASSESSMENT:
      - Provide a detailed paragraph (threatImpact) explaining the specific security impact on the victim's machine. E.g. "This package installs a post-install hook that reads /etc/passwd and transmits it to a remote server 192.168.x.x, effectively compromising system credentials."

      Return the result in strict JSON format.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, 
      }
    });

    let resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    // Sanitize the response in case the model wraps it in Markdown code blocks
    resultText = resultText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

    const data = JSON.parse(resultText) as AnalysisResult;
    return data;

  } catch (error) {
    console.error("Analysis failed:", error);
    // Fallback safe result
    return {
      packageName: packageName,
      version: "unknown",
      riskScore: 0,
      riskLevel: RiskLevel.LOW,
      summary: "Analysis incomplete. The package could not be fully resolved by the neural engine. Defaulting to safe posture.",
      threatImpact: "No threat impact data available due to connection error.",
      riskBreakdown: { staticScore: 0, dynamicScore: 0 },
      staticAnalysis: { findings: [], suspiciousFiles: [] },
      dynamicAnalysis: { networkActivity: [], fileSystemAccess: [], processSpawning: [] }
    };
  }
};