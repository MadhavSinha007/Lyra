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
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Camera className="mr-2" /> Capture Your Expression
      </h2>

      <div className="mb-6">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
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
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-blue-300"
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
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >
            Retake Photo
          </button>
        )}

        <button
          onClick={goToNextStep}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg ${emotion ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}
        >
          {emotion ? 'Next' : 'Skip to Text Input'}
        </button>
      </div>
    </div>
  );
};

export default CaptureStep;

