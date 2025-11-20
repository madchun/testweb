import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  styleName?: string;
}

const LOADING_MESSAGES = [
  'Analyzing your photo...',
  'Applying AI magic...',
  'Transforming your style...',
  'Generating your masterpiece...',
  'Almost there...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ styleName }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Cycle through messages
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    // Animate dots
    const dotsTimer = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(messageTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-900 text-white">
      <div className="text-center space-y-8 max-w-2xl p-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="text-8xl animate-bounce">✨</div>
          {/* Rotating ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Style Name */}
        {styleName && (
          <h2 className="text-3xl font-bold text-secondary">
            Creating your {styleName} style
          </h2>
        )}

        {/* Loading Message */}
        <div className="space-y-4">
          <p className="text-2xl font-semibold">
            {LOADING_MESSAGES[messageIndex]}
            {dots}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div className="bg-secondary h-full rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Fun Fact */}
        <p className="text-lg opacity-75 italic">
          "AI is processing millions of pixels to create your perfect photo!"
        </p>
      </div>
    </div>
  );
};
