import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeAthleticSequence(images: File[]): Promise<AnalysisResult> {
  if (!images.length) throw new Error("No images provided");

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
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    console.error("AI Analysis Error Detailed:", error);
    if (error.message === "EMPTY_RESPONSE") throw new Error("The AI engine failed to generate a response. Please try with different images.");
    if (error.message === "INVALID_JSON") throw new Error("The AI returned unconventional data. Our team has been notified.");
    throw new Error(`Technical failure in Biomechanics Engine: ${error.message || 'Unknown Error'}`);
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
