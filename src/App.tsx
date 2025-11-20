import React, { useState } from 'react';
import { AppState, PhotoData, StyleOption } from './types/index';
import { AttractScreen } from './components/AttractScreen';
import { CameraCapture } from './components/CameraCapture';
import { StyleSelection } from './components/StyleSelection';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultDisplay } from './components/ResultDisplay';
import { SettingsModal } from './components/SettingsModal';
import { getSettings } from './utils/storage';
import { generateStyledImage, uploadImage } from './services/geminiService';
import { createFinalPhoto } from './utils/imageProcessing';

function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [photoData, setPhotoData] = useState<PhotoData>({
    capturedImage: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Idle timeout to return to IDLE state (3 minutes)
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (appState !== 'IDLE' && appState !== 'PROCESSING') {
      timeout = setTimeout(() => {
        handleReset();
      }, 180000); // 3 minutes
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [appState]);

  const handleReset = () => {
    setAppState('IDLE');
    setPhotoData({ capturedImage: '' });
    setError(null);
  };

  const handleStart = () => {
    setAppState('CAMERA');
  };

  const handleCapture = (imageData: string) => {
    setPhotoData({ capturedImage: imageData });
    setAppState('REVIEW');
  };

  const handleRetake = () => {
    setAppState('CAMERA');
  };

  const handleSelectStyle = async (style: StyleOption) => {
    setAppState('PROCESSING');
    setPhotoData((prev) => ({ ...prev, selectedStyle: style }));

    try {
      const settings = getSettings();

      if (!settings.geminiApiKey) {
        throw new Error('Gemini API key is not configured. Please check settings.');
      }

      // Step 1: Generate AI-styled image
      const styledImage = await generateStyledImage(
        settings.geminiApiKey,
        photoData.capturedImage,
        style
      );

      // Step 2: Create final 4R photo with overlay
      const finalImage = await createFinalPhoto(
        styledImage,
        settings.overlayImageUrl
      );

      // Step 3: Upload to webhook and get URL
      let imageUrl: string | undefined;

      if (settings.webhookUrl) {
        try {
          imageUrl = await uploadImage(settings.webhookUrl, finalImage, {
            style: style.name,
            timestamp: new Date().toISOString(),
          });
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          // Continue without QR code
        }
      }

      // Update state with results
      setPhotoData((prev) => ({
        ...prev,
        processedImage: finalImage,
        qrCodeUrl: imageUrl,
      }));

      setAppState('RESULT');
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      // Go back to review to try again
      setTimeout(() => {
        setError(null);
        setAppState('REVIEW');
      }, 5000);
    }
  };

  const handleDone = () => {
    handleReset();
  };

  const settings = getSettings();

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Settings Button - Always visible */}
      {appState === 'IDLE' && (
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 z-50 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full shadow-lg backdrop-blur-sm"
          title="Settings"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}

      {/* State Machine Rendering */}
      {appState === 'IDLE' && (
        <AttractScreen onStart={handleStart} schoolName={settings.schoolName} />
      )}

      {appState === 'CAMERA' && (
        <CameraCapture onCapture={handleCapture} onCancel={handleReset} />
      )}

      {appState === 'REVIEW' && (
        <StyleSelection
          capturedImage={photoData.capturedImage}
          onSelectStyle={handleSelectStyle}
          onRetake={handleRetake}
        />
      )}

      {appState === 'PROCESSING' && (
        <LoadingScreen styleName={photoData.selectedStyle?.name} />
      )}

      {appState === 'RESULT' && photoData.processedImage && (
        <ResultDisplay
          finalImage={photoData.processedImage}
          imageUrl={photoData.qrCodeUrl}
          onDone={handleDone}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
          <p className="font-semibold">❌ Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
