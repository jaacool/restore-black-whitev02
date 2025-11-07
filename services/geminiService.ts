import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const RESTORATION_PROMPT = `You are an expert photo restoration AI. Your primary mission is to transform this old, potentially damaged, black-and-white photograph into a vibrant, modern image that looks as if it were captured in 2025 with a professional-grade digital camera (e.g., a Sony A7R V).

**Content Integrity Mandate (Absolute Rule):**
- **You MUST NOT alter the content of the photograph.**
- **Do NOT add, remove, or change any people, objects, animals, or significant background elements.**
- Your task is strictly limited to restoration and colorization of what is present in the original image.
- Preserve the original composition and subjects exactly as they are. Do not invent details that are not implicitly suggested by the original photo's data.

**Primary Directives (Execute in this strict order):**

**1. Comprehensive Perspective and Geometry Correction:**
   - **Mandatory First Step:** Analyze the photograph for any geometric distortions, including tilt, skew, and lens distortion.
   - **Action:** Correct the perspective rigorously. Ensure all vertical lines are perfectly vertical and horizontal lines are perfectly horizontal. The entire scene must appear geometrically correct and stable, as if shot with a modern, corrected lens. Do not crop out important details unless absolutely necessary to fix the geometry.

**2. Pre-Colorization Analysis & Reasoning (Internal Thought Process):**
   - **Crucial Step:** Before applying any color, perform an extensive internal analysis. Deconstruct the image into its constituent parts: main subject(s), background, foreground, small objects, clothing, furniture, environment (sky, trees, buildings, etc.).
   - **Logical Color Deduction:** For each identified element, reason about its most probable and realistic color. Consider the historical context, the material of the object (e.g., wood, fabric, metal, skin), and the inferred lighting conditions.
   - **Develop a Cohesive Palette:** Based on this analysis, formulate a complete and harmonious color palette for the entire scene. This palette must ensure that all colors work together under a single, consistent light source. This "thinking" phase is critical to avoid inconsistent or unrealistic color choices.

**3. Full Scene Colorization and Restoration:**
   - **Holistic Application:** Execute the colorization based on the palette developed in the previous step. You must colorize the **entire image** with the decided ultra-realistic, natural colors. This includes every detail from the deep background to the immediate foreground.
   - **Color Fidelity and Style:** The final image must have a full, rich, and modern color spectrum. **Crucially, you must avoid any retro, vintage, or sepia tones.** The goal is complete color realism, not an artistic interpretation. The colors throughout the entire scene must be consistent and harmonious, governed by the single, natural lighting source you reasoned about. Avoid the "hand-painted" or "colorized" look where the background is faded or monochromatic. Every part of the image must be fully and realistically colored.
   - **Detail Enhancement & Skin Realism:** Restore and enhance fine details and textures across the entire photograph. The final image should possess the high dynamic range and sharpness of a modern digital photo. A critical aspect of this is the realistic rendering of skin. **Avoid an overly smooth, 'airbrushed' or 'plastic' appearance.** Instead, meticulously recreate or preserve natural skin textures, including pores, fine lines, and subtle imperfections appropriate for the subject's age. The goal is lifelike skin, not digitally perfected skin. Skin tones must be rendered with natural, subtle variations.

**4. Removal of Non-Photographic Elements:**
   - **Clean Up:** After colorization, remove any elements that are not part of the original photographic scene. This includes handwritten text, timestamps, borders, dust, scratches, and stains. The final output must be a clean photograph, free of any superimposed artifacts.

**Final Goal:** The resulting image must be indistinguishable from a high-quality photograph taken in 2025. The restoration should be seamless and completely photorealistic.`;


export const restorePhoto = async (base64ImageData: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // 'nano banana'
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: RESTORATION_PROMPT,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI model failed to process the image.");
  }
};