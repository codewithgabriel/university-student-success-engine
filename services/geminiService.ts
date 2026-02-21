
import { GoogleGenAI, Type } from "@google/genai";
import { StudentRecord, AnalysisResult, RiskLevel } from "../types";

export const analyzeStudentData = async (records: StudentRecord[]): Promise<AnalysisResult[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Analyze the following student dataset to identify academic risk patterns. 
  Rules:
  1. For every student, categorize as "High Risk", "Moderate Risk", or "On Track".
  2. Provide a Root Cause Analysis explaining why.
  3. Suggest a specific Intervention Strategy for the advisor.
  4. Refer to students by ID only.
  5. Provide a riskScore from 0 to 100 (100 is highest risk).

  Student Data:
  ${JSON.stringify(records, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            studentId: { type: Type.STRING },
            riskLevel: {
              type: Type.STRING,
              description: "Must be 'High Risk', 'Moderate Risk', or 'On Track'"
            },
            rootCause: { type: Type.STRING },
            interventionStrategy: { type: Type.STRING },
            riskScore: { type: Type.NUMBER }
          },
          required: ["studentId", "riskLevel", "rootCause", "interventionStrategy", "riskScore"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (err) {
    console.error("Failed to parse AI response", err);
    return [];
  }
};
