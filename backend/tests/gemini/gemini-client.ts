/**
 * Minimal Gemini REST API Client for Testing
 * Uses direct fetch calls without any Google Cloud dependencies
 */

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

// Rate limiting: Track last request time to avoid hitting free tier limits
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 12000; // 12 seconds between requests (5 per minute = 12s interval)

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Rate limit: waiting ${Math.ceil(waitTime / 1000)}s before next request...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

export class GeminiClient {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    // Use gemini-1.5-flash-8b-latest (note: without -latest suffix it was working)
    this.model = "gemini-2.5-flash";
    
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
  }

  async generateContent(prompt: string, temperature = 0.7): Promise<GeminiResponse> {
    // Wait for rate limit before making request
    await waitForRateLimit();
    
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: 2048,
      },
    };

    console.log(`🔄 Sending request to Gemini API...`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    console.log(`✅ Response received`);
    return response.json();
  }

  extractText(response: GeminiResponse): string {
    if (response.error) {
      throw new Error(`Gemini error: ${response.error.message}`);
    }

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates in response");
    }

    const text = response.candidates[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No text in response");
    }

    return text;
  }

  extractJSON<T = any>(response: GeminiResponse): T {
    const text = this.extractText(response);
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      return JSON.parse(jsonText.trim());
    } catch (error) {
      throw new Error(`Failed to parse JSON from response: ${text}`);
    }
  }
}
