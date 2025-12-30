import { APPS_DATA } from "../constants";
import { SearchResult } from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function semanticSearch(query: string): Promise<SearchResult[]> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.warn("OpenRouter API Key is missing. Falling back to local keyword search.");
    return APPS_DATA
      .filter(app => 
        app.name.toLowerCase().includes(query.toLowerCase()) || 
        app.summary.toLowerCase().includes(query.toLowerCase())
      )
      .map(app => ({ appId: app.id, relevance: "Local keyword match" }));
  }

  const appCorpus = APPS_DATA.map(app => ({
    id: app.id,
    name: app.name,
    summary: app.summary,
    tags: app.tags.join(', ')
  }));

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Vibe Hub"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // Using free tier model
        messages: [
          {
            role: "user",
            content: `Given the following list of applications, identify the top 5 that best match the user's intent: "${query}". 
Return ONLY a valid JSON array with this exact structure:
[{"appId": "string", "relevance": "one sentence explanation"}]

Apps: ${JSON.stringify(appCorpus)}

Remember: Return ONLY the JSON array, no other text.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in OpenRouter response");
    }

    // Extract JSON from response (handle cases where AI adds markdown formatting)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON array found in response");
    }

    const results: SearchResult[] = JSON.parse(jsonMatch[0]);
    return results.slice(0, 5); // Ensure max 5 results
    
  } catch (error) {
    console.error("OpenRouter search failed:", error);
    // Fallback to local search
    return APPS_DATA
      .filter(app => 
        app.name.toLowerCase().includes(query.toLowerCase()) || 
        app.summary.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(app => ({ appId: app.id, relevance: "Fallback keyword match" }));
  }
}
