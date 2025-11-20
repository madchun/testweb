import { AppSettings } from '../types';

const SETTINGS_KEY = 'photo-booth-settings';

export const getSettings = (): Partial<AppSettings> => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading settings from localStorage:', error);
  }

  // Return defaults from environment variables if available
  return {
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    webhookUrl: import.meta.env.VITE_WEBHOOK_URL || '',
    schoolName: 'School Open Day',
  };
};

export const saveSettings = (settings: Partial<AppSettings>): void => {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
};

export const clearSettings = (): void => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Error clearing settings from localStorage:', error);
  }
};
