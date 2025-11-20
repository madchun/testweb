/**
 * Image processing utilities for creating 4R formatted photos
 * 4R size: 1200x1800 pixels (4x6 inches at 300 DPI)
 */

export const PHOTO_4R_WIDTH = 1200;
export const PHOTO_4R_HEIGHT = 1800;

/**
 * Creates a canvas with the specified dimensions
 */
export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Loads an image from a data URL or URL
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Converts a canvas to a base64 data URL
 */
export const canvasToDataUrl = (canvas: HTMLCanvasElement, quality: number = 0.95): string => {
  return canvas.toDataURL('image/jpeg', quality);
};

/**
 * Draws an image on canvas with cover fit (fills the entire canvas while maintaining aspect ratio)
 */
export const drawImageCoverFit = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
): void => {
  const imgAspect = img.width / img.height;
  const canvasAspect = canvasWidth / canvasHeight;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > canvasAspect) {
    // Image is wider than canvas
    drawHeight = canvasHeight;
    drawWidth = img.width * (canvasHeight / img.height);
    offsetX = (canvasWidth - drawWidth) / 2;
  } else {
    // Image is taller than canvas
    drawWidth = canvasWidth;
    drawHeight = img.height * (canvasWidth / img.width);
    offsetY = (canvasHeight - drawHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
};

/**
 * Composites the AI-generated image with an optional overlay frame
 * Returns a 4R formatted image as base64
 */
export const createFinalPhoto = async (
  aiImageBase64: string,
  overlayImageUrl?: string
): Promise<string> => {
  const canvas = createCanvas(PHOTO_4R_WIDTH, PHOTO_4R_HEIGHT);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw AI generated image (cover fit)
  const aiImage = await loadImage(aiImageBase64);
  drawImageCoverFit(ctx, aiImage, PHOTO_4R_WIDTH, PHOTO_4R_HEIGHT);

  // Draw overlay frame if provided
  if (overlayImageUrl) {
    try {
      const overlayImage = await loadImage(overlayImageUrl);
      ctx.drawImage(overlayImage, 0, 0, PHOTO_4R_WIDTH, PHOTO_4R_HEIGHT);
    } catch (error) {
      console.warn('Failed to load overlay image:', error);
    }
  }

  return canvasToDataUrl(canvas, 0.95);
};

/**
 * Captures a frame from a video element
 */
export const captureVideoFrame = (video: HTMLVideoElement): string => {
  const canvas = createCanvas(video.videoWidth, video.videoHeight);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Mirror the image horizontally (selfie mode)
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0);

  return canvasToDataUrl(canvas, 0.95);
};

/**
 * Converts a base64 string to a Blob
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};
