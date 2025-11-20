import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { getSettings, saveSettings } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentSettings = getSettings();
      setSettings(currentSettings);
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleChange = (field: keyof AppSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings(settings);
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleCancel}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold">⚙️ Settings</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* School Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              School Name
            </label>
            <input
              type="text"
              value={settings.schoolName || ''}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              placeholder="School Open Day"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed on the welcome screen
            </p>
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Google Gemini API Key *
            </label>
            <input
              type="password"
              value={settings.geminiApiKey || ''}
              onChange={(e) => handleChange('geminiApiKey', e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for AI image generation. Get it from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Webhook URL *
            </label>
            <input
              type="url"
              value={settings.webhookUrl || ''}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              placeholder="https://your-webhook-url.com/upload"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for QR code generation. Use N8N, Make, or custom endpoint.
            </p>
          </div>

          {/* Overlay Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Overlay Frame URL (Optional)
            </label>
            <input
              type="url"
              value={settings.overlayImageUrl || ''}
              onChange={(e) => handleChange('overlayImageUrl', e.target.value)}
              placeholder="https://example.com/frame.png"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional branded frame overlay (1200x1800px recommended)
            </p>
          </div>

          {/* Warning if missing required fields */}
          {(!settings.geminiApiKey || !settings.webhookUrl) && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-semibold">
                ⚠️ Required Configuration Missing
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Both Gemini API Key and Webhook URL are required for the photo booth to function properly.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-6 py-2 bg-primary hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
