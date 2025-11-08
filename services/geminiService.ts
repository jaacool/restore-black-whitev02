import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    
    // In this environment, the build process (e.g., on Vercel) replaces `process.env.VITE_API_KEY`.
    const API_KEY = process.env.VITE_API_KEY;
    if (!API_KEY) {
      throw new Error("API Key is not configured. Please set the VITE_API_KEY environment variable in your hosting provider.");
    }

    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
};


export const restorePhoto = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const genAI = getAiInstance();
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
         throw new Error(`Request was blocked. Reason: ${blockReason}`);
      }
      throw new Error("The AI model returned an empty response.");
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Image generation failed. Reason: ${candidate.finishReason}.`);
    }

    if (!candidate.content || !candidate.content.parts) {
      throw new Error("The AI model returned an invalid response structure.");
    }

    const imagePart = candidate.content.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }
    
    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`The AI model failed to process the image: ${error.message}`);
    }
    throw new Error("The AI model failed to process the image due to an unknown error.");
  }
};