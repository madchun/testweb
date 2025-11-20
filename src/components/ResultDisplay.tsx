import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface ResultDisplayProps {
  finalImage: string;
  imageUrl?: string;
  onDone: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  finalImage,
  imageUrl,
  onDone,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate QR code
    if (qrCanvasRef.current && imageUrl) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        imageUrl,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#1e3a8a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) {
            console.error('Error generating QR code:', error);
          }
        }
      );
    }
  }, [imageUrl]);

  return (
    <div className="w-full h-full flex bg-background">
      {/* Left Side - Final Image */}
      <div className="w-2/3 bg-gray-900 flex items-center justify-center p-12">
        <div className="max-w-2xl">
          <img
            src={finalImage}
            alt="Final Result"
            className="w-full rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Right Side - QR Code and Instructions */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8">
        <div className="text-center space-y-6">
          {/* Success Message */}
          <div className="space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-4xl font-bold text-primary">
              Your Photo is Ready!
            </h2>
          </div>

          {/* QR Code */}
          {imageUrl ? (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
                <canvas ref={qrCanvasRef}></canvas>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-800">
                  📱 Scan to download your photo
                </p>
                <p className="text-sm text-gray-600">
                  Use your phone's camera to scan the QR code
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-6">
              <p className="text-lg text-yellow-800">
                ⚠️ QR code unavailable
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Webhook URL not configured. Please contact staff.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-primary rounded-lg p-6 text-left">
            <h3 className="font-semibold text-lg text-primary mb-3">
              📋 How to save your photo:
            </h3>
            <ol className="space-y-2 text-gray-700">
              <li>1. Open your phone's camera</li>
              <li>2. Point at the QR code above</li>
              <li>3. Tap the notification to open the link</li>
              <li>4. Save or share your photo!</li>
            </ol>
          </div>

          {/* Done Button */}
          <button
            onClick={onDone}
            className="bg-secondary hover:bg-yellow-500 text-gray-900 font-bold text-2xl px-12 py-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            Done! Start Over
          </button>
        </div>
      </div>
    </div>
  );
};
