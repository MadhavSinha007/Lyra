import React from 'react';
import { Mic } from 'lucide-react';

const DescribeStep = ({ 
  image, 
  emotion, 
  userText, 
  setUserText, 
  audioTranscript, 
  isRecording, 
  toggleRecording, 
  isLoading, 
  submitForAnalysis, 
  goToPrevStep 
}) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-6">Describe Your Feelings</h2>

      {image && (
        <div className="mb-6 flex items-center justify-center">
          <img 
            src={image} 
            alt="Captured expression" 
            className="h-32 rounded-lg border border-gray-200"
          />
          {emotion && (
            <div className="ml-4 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">
              Detected: {emotion}
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Describe your feelings..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          rows={4}
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Voice Input</span>
          <button
            onClick={toggleRecording}
            className={`flex items-center text-sm ${isRecording ? 'text-red-500' : 'text-teal-600'}`}
          >
            <Mic className="mr-1 h-4 w-4" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg min-h-[100px]">
          {audioTranscript || "Speech transcription will appear here..."}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={goToPrevStep}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={submitForAnalysis}
          disabled={isLoading || (!userText && !audioTranscript && !emotion)}
          className={`px-6 py-2 rounded-lg ${
            isLoading || (!userText && !audioTranscript && !emotion) 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-teal-500 hover:bg-teal-600 text-white cursor-pointer'
          }`}
        >
          {isLoading ? 'Analyzing...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default DescribeStep;
