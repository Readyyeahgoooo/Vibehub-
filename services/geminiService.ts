
import { GoogleGenAI, Type } from "@google/genai";
import { APPS_DATA } from "../constants";
import { SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function semanticSearch(query: string): Promise<SearchResult[]> {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing. Falling back to local keyword search.");
    return APPS_DATA
      .filter(app => app.name.toLowerCase().includes(query.toLowerCase()) || 
                     app.summary.toLowerCase().includes(query.toLowerCase()))
      .map(app => ({ appId: app.id, relevance: "Local match" }));
  }

  const appCorpus = APPS_DATA.map(app => ({
    id: app.id,
    name: app.name,
    summary: app.summary,
    tags: app.tags.join(', ')
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given the following list of applications, identify the top 5 that best match the user's intent: "${query}". 
      Return the app IDs and a short 1-sentence explanation of why it matches.
      Apps: ${JSON.stringify(appCorpus)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              appId: { type: Type.STRING },
              relevance: { type: Type.STRING }
            },
            required: ["appId", "relevance"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini search failed:", error);
    return [];
  }
}
