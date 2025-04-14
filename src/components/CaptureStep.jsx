import React from 'react';
import { Camera } from 'lucide-react';

const CaptureStep = ({ 
  videoRef, 
  canvasRef, 
  isLoading, 
  videoStream, 
  showCanvas, 
  emotion, 
  captureAndPredict, 
  setShowCanvas, 
  goToNextStep 
}) => {
  return (
    <div className="bg-black text-white p-8 rounded-xl shadow-md border border-white">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Camera className="mr-2" /> Capture Your Expression
      </h2>

      <div className="mb-6">
        <div className="relative aspect-video bg-white rounded-lg overflow-hidden">
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas 
            ref={canvasRef}
            className={`w-full h-full object-cover ${showCanvas ? 'block' : 'hidden'}`}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {videoStream && (
          <button
            onClick={captureAndPredict}
            disabled={isLoading}
            className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-lg disabled:opacity-50 transition"
          >
            {isLoading ? 'Processing...' : 'Capture & Analyze'}
          </button>
        )}

        {showCanvas && (
          <button
            onClick={() => {
              setShowCanvas(false);
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
            }}
            className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-lg transition"
          >
            Retake Photo
          </button>
        )}

        <button
          onClick={goToNextStep}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg transition ${
            emotion
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white border border-white opacity-50 cursor-not-allowed'
          }`}
        >
          {emotion ? 'Next' : 'Skip to Text Input'}
        </button>
      </div>
    </div>
  );
};

export default CaptureStep;
