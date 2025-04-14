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
  const [step, setStep] = useState(1);
  const [emotion, setEmotion] = useState(null);
  const [userText, setUserText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spotifyRecommendations, setSpotifyRecommendations] = useState([]);
  const [breathingExercises, setBreathingExercises] = useState([]);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (step === 1 && videoRef.current && !videoStream) {
      startCamera();
    }
  }, [step, videoRef.current, videoStream]);

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

        const ctx = canvasRef.current.getContext('2d');
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FFFFFF';
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
    <div className="min-h-screen w-full bg-black text-white">
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <Header className="bg-black border-b border-white/10" />

        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Error displays at the top */}
            <ErrorDisplay 
              error={error}
              cameraError={cameraError}
              recognitionError={recognitionError}
              className="mb-6"
            />

            {/* Progress steps */}
            <div className="mb-10">
              <ProgressSteps currentStep={step} />
            </div>

            {/* Main content */}
            <main className="w-full">
              {[1, 2, 3].includes(step) && (
                <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 md:p-8">
                    {step === 1 && (
                      <>
                        <h2 className="text-3xl font-bold text-center mb-8 text-white">
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
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <h2 className="text-3xl font-bold text-center mb-8 text-white">
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
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <h2 className="text-3xl font-bold text-center mb-8 text-white">
                          Your Personalized Insights
                        </h2>
                        <ResultsStep 
                          aiResponse={aiResponse}
                          breathingExercises={breathingExercises}
                          spotifyRecommendations={spotifyRecommendations}
                          resetApp={resetApp}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalysisPage;
