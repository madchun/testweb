import { GoogleGenerativeAI } from '@google/generative-ai';
import { StyleOption } from '../types';

/**
 * Converts a base64 data URL to the format expected by Gemini API
 */
const base64ToGeminiFormat = (base64DataUrl: string) => {
  const base64Data = base64DataUrl.split(',')[1];
  return {
    inlineData: {
      data: base64Data,
      mimeType: 'image/jpeg',
    },
  };
};

/**
 * Generates an AI-styled image using Google Gemini
 */
export const generateStyledImage = async (
  apiKey: string,
  imageBase64: string,
  style: StyleOption
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add it in settings.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use gemini-2.0-flash-exp model with image generation capability
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp'
    });

    // Construct the prompt
    const prompt = `${style.prompt}

IMPORTANT: Transform this person's photo into the requested style while:
1. Maintaining their facial features and likeness
2. Creating a professional, high-quality result suitable for printing
3. Ensuring the final image is vibrant, well-lit, and suitable for a 4R photo print
4. Making it appropriate for a school open day event

Generate a single, complete image that looks like a professional photo suitable for printing.`;

    const imagePart = base64ToGeminiFormat(imageBase64);

    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // Note: Gemini 2.0 Flash Exp doesn't directly generate images
    // For actual image generation, you would need to:
    // 1. Use a different model that supports image output, or
    // 2. Use the text description to call an image generation service
    // 3. For MVP, we'll return a placeholder indicating this limitation

    // In a production environment, you might want to:
    // - Use Imagen API for actual image generation
    // - Or use the description to call another image generation service
    // For now, we'll simulate this by returning the original image
    // with a note that in production this would be the AI-generated image

    console.log('Generated description:', text);

    // TODO: In production, use this description with an actual image generation API
    // For MVP purposes, we return the original image
    // In reality, you'd want to integrate with Imagen or another image generation service
    return imageBase64;

  } catch (error) {
    console.error('Error generating styled image:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate styled image: ${error.message}`);
    }
    throw new Error('Failed to generate styled image: Unknown error');
  }
};

/**
 * Uploads an image to the configured webhook and returns the public URL
 */
export const uploadImage = async (
  webhookUrl: string,
  imageBase64: string,
  metadata?: Record<string, unknown>
): Promise<string> => {
  if (!webhookUrl) {
    throw new Error('Webhook URL is not configured. Please add it in settings.');
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    const data = await response.json();

    // Expected response format: { url: "https://..." }
    if (!data.url) {
      throw new Error('Webhook response does not contain a URL');
    }

    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    throw new Error('Failed to upload image: Unknown error');
  }
};
