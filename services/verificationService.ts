// Client-side verification service
// Images are sent directly to OpenRouter for verification, no storage needed

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  extractedUsername?: string;
  reason?: string;
}

/**
 * Convert image file to base64 for API transmission
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Verify screenshot ownership using AI vision
 * No backend storage needed - image is analyzed and discarded
 */
export async function verifyScreenshot(
  screenshotFile: File,
  claimedUsername: string,
  sourceUrl: string
): Promise<VerificationResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return {
      verified: false,
      confidence: 0,
      reason: 'API key not configured'
    };
  }

  try {
    // Convert image to base64
    const base64Image = await fileToBase64(screenshotFile);
    
    // Call OpenRouter with vision model
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Vibe Hub"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // Free vision model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this screenshot and extract the username/account name visible in the image. 
Look for profile names, @handles, or account identifiers.
The user claims their username is: "${claimedUsername}"
The source URL is: ${sourceUrl}

Return ONLY a JSON object with this structure:
{
  "username": "extracted username from image",
  "confidence": 0.0-1.0,
  "verified": true/false,
  "reason": "brief explanation"
}

Compare the extracted username with the claimed username (case-insensitive, ignore @ prefix).
Set verified to true only if they match.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${screenshotFile.type};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 500
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

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        verified: false,
        confidence: 0,
        reason: "Could not parse AI response"
      };
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      verified: result.verified || false,
      confidence: result.confidence || 0,
      extractedUsername: result.username,
      reason: result.reason
    };
    
  } catch (error) {
    console.error("Verification failed:", error);
    return {
      verified: false,
      confidence: 0,
      reason: error instanceof Error ? error.message : "Verification failed"
    };
  }
}

/**
 * Simplified submission - no image storage needed
 */
export interface SubmissionData {
  appName: string;
  summary: string;
  tags: string[];
  creator: string;
  category: string;
  sourceUrl: string;
  language: string;
  verificationResult: VerificationResult;
}

/**
 * Submit app after verification
 * This would call a backend endpoint to store the submission
 */
export async function submitApp(data: SubmissionData): Promise<{ success: boolean; message: string }> {
  // For now, just return success
  // In production, this would call your backend API
  console.log('Submission data:', data);
  
  return {
    success: true,
    message: 'Submission received! Your app will be reviewed shortly.'
  };
}
