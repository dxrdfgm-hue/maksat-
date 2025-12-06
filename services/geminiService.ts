import { GoogleGenAI, Type } from "@google/genai";
import { ScenarioAnalysis, Character } from "../types";

// Initialize Gemini Client
// WARNING: In a production environment, API keys should not be exposed on the client side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the scenario text to extract visual scene descriptions and style.
 */
export const analyzeScenario = async (scenarioText: string): Promise<ScenarioAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following scenario and break it down into a distinct scene for EVERY specific action or movement described. Do not summarize multiple actions into one. If the character performs a sequence of actions, create a separate visual description for each one.
      
      Scenario:
      ${scenarioText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING, description: "Сценарийдің жалпы визуалды стилі (мысалы: Киберпанк, Нуар, Тарихи драма)" },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Қимылдың немесе әрекеттің қысқаша атауы" },
                  visualDescription: { type: Type.STRING, description: "Осы нақты қимылды бейнелейтін суретке арналған толық визуалды сипаттама (ағылшынша жазған дұрыс)" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    // Robust JSON extraction: Find the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonString = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonString) as ScenarioAnalysis;
    }
    
    // Fallback if no JSON object found (though schema constraint should prevent this)
    throw new Error("Invalid JSON format in response");
  } catch (error) {
    console.error("Error analyzing scenario:", error);
    throw error;
  }
};

/**
 * Generates an image based on a prompt using gemini-2.5-flash-image.
 * Accepts a list of characters (name + image) to use as references.
 */
export const generateImageFromPrompt = async (prompt: string, characters: Character[] = []): Promise<string> => {
  try {
    const parts: any[] = [];
    let characterDescriptions = "";

    // 1. Add all reference images first (Visual Context)
    if (characters.length > 0) {
      characters.forEach((char, index) => {
        if (!char.imageBase64) return;
        
        // Extract mime type from base64 string safely
        const match = char.imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mimeType = match ? match[1] : 'image/jpeg';
        
        // Safely extract data part
        const base64Data = char.imageBase64.includes(',') 
          ? char.imageBase64.split(',')[1] 
          : char.imageBase64;
        
        if (base64Data) {
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
          // Build a mapping string for the text prompt
          characterDescriptions += `Reference Image ${index + 1} represents the character named "${char.name}". `;
        }
      });
    }

    // 2. Construct the final prompt text
    let finalPromptText = `Create a high-quality cinematic image. `;
    
    if (characters.length > 0) {
      finalPromptText += `\n\nCONTEXT FROM REFERENCE IMAGES:\n${characterDescriptions}\n`;
      finalPromptText += `INSTRUCTION: You MUST ensure the characters in the generated scene physically resemble the persons in the reference images provided above, matching their facial features and hair.\n`;
    }

    finalPromptText += `\nSCENE DESCRIPTION:\n${prompt}`;

    // 3. Add the text prompt part
    parts.push({ text: finalPromptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Edits a user uploaded image to match the scenario style.
 */
export const editUserImage = async (base64Image: string, styleDescription: string): Promise<string> => {
  try {
    // Extract mime type safely
    const match = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Transform this image to match the following style: ${styleDescription}. Keep the person's identity but change the environment, lighting, and clothing to fit the style.`
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error editing user image:", error);
    throw error;
  }
};