import React, { useEffect, useRef, useState } from 'react';
import { captureVideoFrame } from '../utils/imageProcessing';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Request camera access
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Failed to access camera. Please check permissions.');
      }
    };

    initCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video stream when it changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCountdown = () => {
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Capture after countdown
          setTimeout(() => {
            if (videoRef.current) {
              const imageData = captureVideoFrame(videoRef.current);
              onCapture(imageData);
            }
          }, 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onCancel();
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <div className="text-center space-y-6">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-3xl font-bold">Camera Error</h2>
          <p className="text-xl">{error}</p>
          <button
            onClick={handleCancel}
            className="bg-secondary hover:bg-yellow-500 text-gray-900 font-bold text-xl px-8 py-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Video Preview - Mirrored for selfie mode */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="text-white text-9xl font-bold animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent z-10">
        <div className="flex justify-center items-center space-x-6">
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            disabled={countdown !== null}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold text-xl px-8 py-4 rounded-lg"
          >
            Cancel
          </button>

          {/* Capture Button */}
          <button
            onClick={startCountdown}
            disabled={countdown !== null}
            className="bg-secondary hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold text-2xl px-12 py-6 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            {countdown !== null ? 'Capturing...' : '📸 Take Photo'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      {countdown === null && (
        <div className="absolute top-8 left-0 right-0 text-center z-10">
          <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg inline-block">
            <p className="text-xl font-semibold">Position yourself in the frame</p>
          </div>
        </div>
      )}
    </div>
  );
};
