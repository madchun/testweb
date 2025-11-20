import React from 'react';

interface AttractScreenProps {
  onStart: () => void;
  schoolName?: string;
}

export const AttractScreen: React.FC<AttractScreenProps> = ({ onStart, schoolName }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-900 text-white p-8">
      <div className="text-center space-y-8 max-w-2xl">
        {/* School Name / Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            {schoolName || 'School Open Day'}
          </h1>
          <h2 className="text-4xl font-semibold text-secondary">
            AI Photo Booth
          </h2>
        </div>

        {/* Description */}
        <p className="text-2xl leading-relaxed opacity-90">
          Transform your selfie into an amazing AI-generated photo!
          Choose from career styles, fantasy themes, and more.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 py-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-5xl">📸</div>
            <p className="text-lg">Take a Selfie</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="text-5xl">✨</div>
            <p className="text-lg">AI Transform</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="text-5xl">🎁</div>
            <p className="text-lg">Get Your Photo</p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="bg-secondary hover:bg-yellow-500 text-gray-900 font-bold text-3xl px-16 py-8 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          TAP TO START
        </button>

        {/* Footer */}
        <p className="text-sm opacity-75 mt-8">
          Powered by Google Gemini AI
        </p>
      </div>
    </div>
  );
};
