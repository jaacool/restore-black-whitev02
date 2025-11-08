import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    
    // The API key is exposed via process.env.API_KEY in this environment.
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API Key is not configured. Please set the API_KEY environment variable in your hosting provider.");
    }

    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
};


export const restorePhoto = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const genAI = getAiInstance();
    
    // Log image size for debugging
    const imageSizeKB = Math.round((base64ImageData.length * 3) / 4 / 1024);
    console.log(`Processing image: ${imageSizeKB} KB, MIME: ${mimeType}`);
    
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
      console.error('API Response:', JSON.stringify(response, null, 2));
      if (blockReason) {
         throw new Error(`Bild wurde blockiert. Grund: ${blockReason}. Bitte versuche ein anderes Bild.`);
      }
      throw new Error("Die KI hat keine Antwort zurückgegeben. Bitte versuche es erneut.");
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.error('Finish Reason:', candidate.finishReason);
      console.error('Full Response:', JSON.stringify(response, null, 2));
      
      // Better error messages for common reasons
      const errorMessages: { [key: string]: string } = {
        'SAFETY': 'Das Bild wurde aus Sicherheitsgründen blockiert. Bitte versuche ein anderes Bild.',
        'RECITATION': 'Das Bild enthält möglicherweise urheberrechtlich geschütztes Material.',
        'MAX_TOKENS': 'Das Bild ist zu komplex. Versuche es mit einem kleineren Bild.',
        'IMAGE_OTHER': 'Das Bild konnte nicht verarbeitet werden. Mögliche Gründe: Zu groß, falsches Format oder API-Limit erreicht. Versuche es mit einem kleineren Bild (max 4MB) oder später erneut.',
      };
      
      const errorMessage = errorMessages[candidate.finishReason] || `Bildverarbeitung fehlgeschlagen: ${candidate.finishReason}`;
      throw new Error(errorMessage);
    }

    if (!candidate.content || !candidate.content.parts) {
      throw new Error("Die KI hat eine ungültige Antwort zurückgegeben.");
    }

    const imagePart = candidate.content.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }
    
    throw new Error("Keine Bilddaten in der API-Antwort gefunden.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw error; // Re-throw with original message
    }
    throw new Error("Die KI konnte das Bild nicht verarbeiten. Unbekannter Fehler.");
  }
};