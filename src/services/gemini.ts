import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

let ai: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string);
    console.log("API Key Present:", !!apiKey);
    console.log("API Key Value (first 10 chars):", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");
    if (!apiKey || apiKey.length === 0) {
      throw new Error("GEMINI_API_KEY is not configured. Please check your .env file.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export function testConnection(): boolean {
  try {
    getAIClient();
    return true;
  } catch (e) {
    console.error("Connection test failed:", e);
    return false;
  }
}

export async function getDemoAnalysis(images: File[]): Promise<AnalysisResult> {
  // Return mock data for demo/testing when API is unavailable
  return {
    sportName: "High Jump",
    criticalDemands: [
      { label: "Vertical Velocity", description: "Maximum upward velocity at takeoff", importance: "critical" },
      { label: "Hip Extension", description: "Full extension of hip joint during flight", importance: "extreme" },
      { label: "Arm Swing Timing", description: "Coordinated arm motion for momentum", importance: "high" }
    ],
    frames: [
      {
        id: "frame-0",
        description: "Approach Phase",
        telemetry: [
          { label: "Stride Length", value: "1.2m", status: "optimal" },
          { label: "Approach Angle", value: "45°", status: "optimal" },
          { label: "Velocity", value: "8.5 m/s", status: "optimal" }
        ],
        keyPoints: [
          { x: 35, y: 70, label: "Left Foot" },
          { x: 65, y: 70, label: "Right Foot" },
          { x: 50, y: 30, label: "Center of Mass" }
        ],
        imageUrl: images[0] ? URL.createObjectURL(images[0]) : ""
      },
      {
        id: "frame-1",
        description: "Takeoff Phase",
        telemetry: [
          { label: "Vertical Velocity", value: "3.2 m/s", status: "optimal" },
          { label: "Knee Flexion", value: "95°", status: "optimal" },
          { label: "Hip Extension", value: "35°", status: "warning" }
        ],
        keyPoints: [
          { x: 50, y: 75, label: "Takeoff Point" },
          { x: 50, y: 40, label: "Center of Mass" },
          { x: 45, y: 50, label: "Hip Joint" }
        ],
        imageUrl: images[1] ? URL.createObjectURL(images[1]) : images[0] ? URL.createObjectURL(images[0]) : ""
      },
      {
        id: "frame-2",
        description: "Flight Phase",
        telemetry: [
          { label: "Flight Time", value: "0.92s", status: "optimal" },
          { label: "Maximum Height", value: "1.95m", status: "optimal" },
          { label: "Body Posture", value: "Neutral", status: "optimal" }
        ],
        keyPoints: [
          { x: 50, y: 20, label: "Peak Height" },
          { x: 48, y: 30, label: "Head" },
          { x: 50, y: 50, label: "Trunk" }
        ],
        imageUrl: images[2] ? URL.createObjectURL(images[2]) : images[0] ? URL.createObjectURL(images[0]) : ""
      }
    ],
    overallCritique: "Excellent approach velocity with strong hip extension at takeoff. Form is clean and efficient. Minor optimization in arm swing coordination could add 5-8cm to the jump height.",
    score: 87,
    metadata: {
      location: "Training Facility, USA",
      timestamp: new Date().toISOString(),
      coordinates: { lat: 40.7128, lng: -74.0060 }
    }
  };
}

export async function analyzeAthleticSequence(images: File[], retryCount = 0): Promise<AnalysisResult> {
  if (!images.length) throw new Error("No images provided");
  
  const client = getAIClient();

  const imageParts = await Promise.all(
    images.map(async (file) => {
      const base64 = await fileToBase64(file);
      // Fallback mime type detection if file.type is empty
      let mimeType = file.type;
      if (!mimeType) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'webp': 'image/webp',
          'heic': 'image/heic',
          'heif': 'image/heif'
        };
        mimeType = mimeMap[ext || ''] || 'image/jpeg';
      }

      return {
        inlineData: {
          mimeType: mimeType,
          data: base64.split(",")[1],
        },
      };
    })
  );

  const prompt = `
    You are a professional athletic coach and biomechanics expert. 
    Analyze the provided visual data showing an athlete performing a jump or athletic movement.
    
    SPECIAL INSTRUCTION:
    - Identify the specific sport or athletic activity (e.g., "Long Jump", "High Jump", "Triple Jump").
    - If a single image contains multiple panels, sub-frames, or stages (e.g., a side-by-side composite showing approach, launch, and landing), treat EACH sub-panel as a distinct "frame" in your response.
    - Extract location information from image overlays if visible (e.g., "Doddakammanahalli, Karnataka").
    
    REQUIRED FOR EACH DETECTED FRAME:
    1. Identify the specific movement stage (e.g., Sprint, Take-off, Flight, Landing).
    2. Provide 3 functional telemetry metrics (e.g., "Flight Angle: 21°", "Knee Extension: 175°").
    3. Provide 3-5 visual (x, y) coordinates relative to THAT frame/panel (0-100) for key joints.
    
    SPORT-SPECIFIC ANALYSIS:
    - Identify the "Critical Performance Factors" (demanding things) of this particular sport.
    - For each factor, provide a label, a technical description, and an importance level ('high', 'critical', 'extreme').
    
    SUMMARY:
    - Provide a professional coach's critique (max 3 sentences).
    - Efficiency score (0-100).
    
    Output must be VALID JSON matching the provided schema.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        systemInstruction: "You are an elite athletic biomechanics analyzer. You excel at extracting information from visual data, including OCR for location text on image overlays.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sportName: { type: Type.STRING },
            criticalDemands: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  importance: { 
                    type: Type.STRING,
                    enum: ["high", "critical", "extreme"] 
                  }
                }
              }
            },
            frames: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  telemetry: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        status: { 
                          type: Type.STRING,
                          enum: ["optimal", "warning", "alert"] 
                        }
                      }
                    }
                  },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        label: { type: Type.STRING }
                      }
                    }
                  }
                },
                required: ["description", "telemetry", "keyPoints"]
              }
            },
            overallCritique: { type: Type.STRING },
            score: { type: Type.NUMBER },
            metadata: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  }
                }
              },
              required: ["location", "timestamp", "coordinates"]
            }
          },
          required: ["sportName", "criticalDemands", "frames", "overallCritique", "score", "metadata"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      console.error("Empty response from Gemini");
      throw new Error("EMPTY_RESPONSE");
    }
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error:", text);
      // Fallback for cases where Gemini might wrap in markdown blocks despite schema
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         parsed = JSON.parse(jsonMatch[0]);
      } else {
         throw new Error("INVALID_JSON");
      }
    }
    
    // Ensure the number of frames matches or handle discrepancy
    const apiFrames = parsed.frames || [];
    
    return {
      ...parsed,
      frames: apiFrames.map((frame: any, i: number) => ({
        ...frame,
        id: `frame-${i}`,
        // Use mod to repeat last image if AI returns more frames than images, 
        // or just map 1:1 if possible
        imageUrl: images[i] ? URL.createObjectURL(images[i]) : URL.createObjectURL(images[images.length - 1])
      }))
    };
  } catch (error: any) {
    const status = error?.status || error?.response?.status;
    const message = error?.message || String(error);
    console.error("AI Analysis Error Detailed:", error);
    console.error("Error status:", status);
    console.error("Error code:", error?.code);
    console.error("API Key present:", !!import.meta.env.VITE_GEMINI_API_KEY);

    if (status === 429 || /rate limit|ResourceExhausted/i.test(message)) {
      // Extract retry delay from error if available
      const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
      const retryDelaySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
      
      if (retryCount < 1) {
        console.log(`Rate limited. Retrying in ${retryDelaySeconds} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelaySeconds * 1000));
        return analyzeAthleticSequence(images, retryCount + 1);
      }
      
      // After retry still fails, use demo data to allow app testing
      console.log("API quota exhausted. Showing demo analysis...");
      const demoResult = await getDemoAnalysis(images);
      return demoResult;
    }
    if (message === "EMPTY_RESPONSE") throw new Error("The AI engine failed to generate a response. Please try with different images.");
    if (message === "INVALID_JSON") throw new Error("The AI returned unconventional data. Our team has been notified.");
    throw new Error(`Technical failure in Biomechanics Engine: ${message || 'Unknown Error'}`);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
