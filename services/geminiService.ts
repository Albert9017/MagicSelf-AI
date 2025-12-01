import { GoogleGenAI } from "@google/genai";
import { ImageAsset } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Helper to extract image from response parts
 */
const extractImageFromResponse = (response: any): string | null => {
  if (!response.candidates?.[0]?.content?.parts) return null;
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Generates a single image variation based on a style prompt
 */
export const generateImageVariation = async (
  sourceImage: ImageAsset, 
  stylePrompt: string
): Promise<string> => {
  try {
    // Remove header if present for sending to API, though some clients handle it.
    // The @google/genai inlineData expects raw base64 without data uri scheme.
    const base64Data = sourceImage.data.split(',')[1] || sourceImage.data;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: sourceImage.mimeType,
            },
          },
          {
            text: `Transform this image into a ${stylePrompt}. Maintain the subject's key features but fully adopt the artistic style. High quality, detailed, centered. Return ONLY the image.`,
          },
        ],
      },
    });

    const imageUrl = extractImageFromResponse(response);
    if (!imageUrl) {
      throw new Error("No image generated in response");
    }
    return imageUrl;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Edits an existing image based on a user instruction
 */
export const editImageWithPrompt = async (
  sourceImage: string, // Base64 data URI
  instruction: string
): Promise<string> => {
  try {
    const mimeType = sourceImage.match(/data:([^;]+);/)?.[1] || 'image/png';
    const base64Data = sourceImage.split(',')[1] || sourceImage;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Edit this image: ${instruction}. Maintain the composition and quality.`,
          },
        ],
      },
    });

    const imageUrl = extractImageFromResponse(response);
    if (!imageUrl) {
      throw new Error("No image generated in edit response");
    }
    return imageUrl;
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};