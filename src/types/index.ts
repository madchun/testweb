export type AppState = 'IDLE' | 'CAMERA' | 'REVIEW' | 'PROCESSING' | 'RESULT';

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
}

export interface AppSettings {
  webhookUrl: string;
  geminiApiKey: string;
  overlayImageUrl?: string;
  schoolName?: string;
}

export interface PhotoData {
  capturedImage: string;
  selectedStyle?: StyleOption;
  processedImage?: string;
  qrCodeUrl?: string;
}
