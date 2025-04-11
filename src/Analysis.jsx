import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';
import ProgressSteps from './components/ProgressSteps';
import CaptureStep from './components/CaptureStep';
import DescribeStep from './components/DescribeStep';
import ResultsStep from './components/ResultsStep';
import useSpeechRecognition from './components/useSpeechRecognition';
import useCamera from './components/useCamera';
import { analyzeImageWithGemini, submitTextForAnalysis, EMOTIONS } from './components/geminiApi';

const EmotionAnalysisPage = () => {
  // Main state
  const [step, setStep] = useState(1);
  const [emotion, setEmotion] = useState(null);
  const [userText, setUserText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spotifyRecommendations, setSpotifyRecommendations] = useState([]);
  const [breathingExercises, setBreathingExercises] = useState([]);
  const [error, setError] = useState(null);

  // Custom hooks
  const { 
    isRecording, 
    audioTranscript, 
    recognitionError, 
    toggleRecording, 
    setAudioTranscript 
  } = useSpeechRecognition();

  const {
    videoRef,
    canvasRef,
    videoStream,
    cameraError,
    showCanvas,
    image,
    startCamera,
    captureImage,
    setShowCanvas,
    setCameraError
  } = useCamera();

  // Start camera when component mounts
  useEffect(() => {
    if (step === 1 && videoRef.current && !videoStream) {
      startCamera();
    }
  }, [step, videoRef.current, videoStream]);

  // Image capture and emotion analysis
  const captureAndPredict = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const imageDataUrl = captureImage();
      if (!imageDataUrl) {
        setError("Failed to capture image");
        setIsLoading(false);
        return;
      }

      const base64Image = imageDataUrl.split(',')[1];
      const detectedEmotion = await analyzeImageWithGemini(base64Image, setError);

      if (detectedEmotion) {
        setEmotion(detectedEmotion);
        
        // Add emotion label to the canvas
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText(`Detected: ${detectedEmotion}`, 20, 40);
      } else {
        setEmotion(null);
        setError("No clear emotion detected. Please ensure your face is visible.");
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Text/voice analysis submission
  const submitForAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const inputText = userText || audioTranscript || "";
      const result = await submitTextForAnalysis(emotion, inputText, setError);
      
      if (result) {
        setAiResponse(result.message);
        setBreathingExercises(result.breathingExercises || []);
        
        if (result.spotifyRecommendations) {
          setSpotifyRecommendations(result.spotifyRecommendations);
        } else if (result.musicRecommendations) {
          setSpotifyRecommendations(result.musicRecommendations.map((song, i) => ({
            name: `${song.title} - ${song.artist}`,
            genre: song.genre,
            mood: song.mood,
            url: `https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`
          })));
        }

        setStep(3);
      }
    } catch (error) {
      setError(`Error processing your request: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset application state
  const resetApp = () => {
    setStep(1);
    setEmotion(null);
    setUserText('');
    setAiResponse('');
    setAudioTranscript('');
    setSpotifyRecommendations([]);
    setBreathingExercises([]);
    setError(null);
    setShowCanvas(false);

    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    
    startCamera();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <Header />
        
        <ErrorDisplay 
          error={error}
          cameraError={cameraError}
          recognitionError={recognitionError}
        />
        
        <ProgressSteps currentStep={step} />
        
        <div className="flex-grow flex flex-col items-center justify-center p-4 w-full overflow-y-auto">
          {step === 1 && (
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Capture Your Emotion
              </h2>
              <CaptureStep 
                videoRef={videoRef}
                canvasRef={canvasRef}
                isLoading={isLoading}
                videoStream={videoStream}
                showCanvas={showCanvas}
                emotion={emotion}
                captureAndPredict={captureAndPredict}
                setShowCanvas={setShowCanvas}
                goToNextStep={() => setStep(2)}
              />
            </div>
          )}
          
          {step === 2 && (
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Describe Your Feelings
              </h2>
              <DescribeStep 
                image={image}
                emotion={emotion}
                userText={userText}
                setUserText={setUserText}
                audioTranscript={audioTranscript}
                isRecording={isRecording}
                toggleRecording={toggleRecording}
                isLoading={isLoading}
                submitForAnalysis={submitForAnalysis}
                goToPrevStep={() => setStep(1)}
              />
            </div>
          )}
          
          {step === 3 && (
            <ResultsStep 
              aiResponse={aiResponse}
              breathingExercises={breathingExercises}
              spotifyRecommendations={spotifyRecommendations}
              resetApp={resetApp}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalysisPage;