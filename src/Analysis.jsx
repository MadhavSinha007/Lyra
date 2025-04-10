import React, { useState, useRef, useEffect } from 'react';
import { Camera, Heart, Music, Mic, XCircle } from 'lucide-react';

const EmotionAnalysisPage = () => {
  // State declarations
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [userText, setUserText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [audioTranscript, setAudioTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [spotifyRecommendations, setSpotifyRecommendations] = useState([]);
  const [breathingExercises, setBreathingExercises] = useState([]);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [recognitionError, setRecognitionError] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);

  const EMOTIONS = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful'];

  // Speech recognition setup
  useEffect(() => {
    const initSpeechRecognition = () => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
              } else {
                interimTranscript += transcript;
              }
            }
            
            if (finalTranscript) {
              setAudioTranscript(prev => prev + finalTranscript);
            }
          };
          
          recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
            setRecognitionError(event.error);
          };
          
          recognitionRef.current = recognition;
        } else {
          setRecognitionError("Speech recognition not supported in this browser");
        }
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        setRecognitionError(error.message);
      }
    };

    initSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
      
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        setRecognitionError(null);
      } catch (error) {
        console.error("Error starting recording:", error);
        setRecognitionError(`Could not start recording: ${error.message}`);
      }
    }
  };

  // Camera handling
  const startCamera = async () => {
    try {
      setCameraError(null);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(err.message);
    }
  };

  // Image capture and analysis
  const captureAndPredict = async () => {
    if (!videoRef.current) {
      setError("Video not ready. Please enable camera first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(imageDataUrl);
        setShowCanvas(true);

        const base64Image = imageDataUrl.split(',')[1];
        const detectedEmotion = await analyzeImageWithGemini(base64Image);
        
        if (detectedEmotion) {
          setEmotion(detectedEmotion);
          // Add text to the canvas
          ctx.font = 'bold 24px Arial';
          ctx.fillStyle = '#FF0000';
          ctx.fillText(`Detected: ${detectedEmotion}`, 20, 40);
        } else {
          setEmotion(null);
          setError("No clear emotion detected. Please ensure your face is visible.");
        }
      }
    } catch (error) {
      console.error("Capture error:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Gemini API call for image analysis
  const analyzeImageWithGemini = async (base64Data) => {
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Analyze this facial expression. Respond ONLY with one word from: happy, sad, angry, neutral, surprised, fearful." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.status}`);
      }
      
      const data = await response.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
        throw new Error("Invalid response format from Gemini API");
      }
      
      const emotionText = data.candidates[0].content.parts[0].text.toLowerCase().trim();
      // Extract just the emotion word (in case API returns more text)
      for (const emotion of EMOTIONS) {
        if (emotionText.includes(emotion)) {
          return emotion;
        }
      }
      return 'neutral'; // Default if no match found
    } catch (error) {
      console.error("Gemini analysis error:", error);
      setError(`Emotion analysis failed: ${error.message}`);
      return null;
    }
  };

  // Text/voice analysis
  const submitForAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const inputText = userText || audioTranscript || "";
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      const promptText = `
Analyze this emotional state:
- Visual emotion: ${emotion || 'unknown'}
- User description: "${inputText}"

Provide a response in the following JSON format ONLY with no additional text:
{
  "message": "A supportive message (1-2 sentences)",
  "breathingExercises": [
    {
      "name": "Exercise name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "duration": "Duration information"
    },
    {
      "name": "Second exercise name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "duration": "Duration information"
    }
  ],
  "musicGenres": ["Genre 1", "Genre 2", "Genre 3"],
  "spotifyPlaylists": ["Playlist name 1", "Playlist name 2", "Playlist name 3"]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.status}`);
      }
      
      const data = await response.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
        throw new Error("Invalid response format from Gemini API");
      }
      
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON content - handle potential text before/after JSON
      let jsonMatch = responseText.match(/(\{[\s\S]*\})/);
      if (!jsonMatch) {
        throw new Error("Could not find valid JSON in the response");
      }
      
      const jsonString = jsonMatch[0];
      const result = JSON.parse(jsonString);

      setAiResponse(result.message);
      setBreathingExercises(result.breathingExercises || []);
      setSpotifyRecommendations((result.spotifyPlaylists || []).map((name, i) => ({
        name,
        genre: result.musicGenres?.[i] || "General",
        url: `https://open.spotify.com/search/${encodeURIComponent(name)}`
      })));
      
      setStep(3);
    } catch (error) {
      console.error("Analysis error:", error);
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
    setImage(null);
    setAudioTranscript('');
    setSpotifyRecommendations([]);
    setBreathingExercises([]);
    setError(null);
    setCameraError(null);
    setRecognitionError(null);
    setShowCanvas(false);
    
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    
    setIsRecording(false);
  };

  // UI rendering
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Emotion Wellness Check</h1>
          <p className="text-lg text-gray-600">
            Share your feelings through images, voice, or text
          </p>
        </div>

        {/* Error Display */}
        {(error || cameraError || recognitionError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || cameraError || recognitionError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${step >= stepNumber ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {stepNumber}
              </div>
              <div className={`mt-2 text-sm ${step >= stepNumber ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                {stepNumber === 1 ? 'Express' : stepNumber === 2 ? 'Describe' : 'Results'}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Camera Capture */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Camera className="mr-2" /> Capture Your Expression
            </h2>
            
            <div className="mb-6">
              {!videoStream ? (
                <div className="bg-gray-100 aspect-video flex items-center justify-center rounded-lg">
                  <button 
                    onClick={startCamera}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg flex items-center"
                  >
                    <Camera className="mr-2" /> Enable Camera
                  </button>
                </div>
              ) : (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${showCanvas ? 'hidden' : 'block'}`}
                  />
                  <canvas 
                    ref={canvasRef}
                    className={`w-full h-full object-cover ${showCanvas ? 'block' : 'hidden'}`}
                  />
                </div>
              )}
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
                onClick={() => setStep(2)}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg ${emotion ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {emotion ? 'Next' : 'Skip to Text Input'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Description Input */}
        {step === 2 && (
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
                onClick={() => setStep(1)}
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
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-6">Your Wellness Recommendations</h2>
            
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Emotional Analysis</h3>
              <p className="text-gray-700">{aiResponse}</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Heart className="mr-2 text-red-500" /> Breathing Exercises
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {breathingExercises.map((exercise, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-teal-600">{exercise.name}</h4>
                    <ul className="mt-2 space-y-1">
                      {exercise.steps.map((step, idx) => (
                        <li key={idx} className="text-gray-700">• {step}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-gray-500">{exercise.duration}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Music className="mr-2 text-yellow-500" /> Music Recommendations
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {spotifyRecommendations.map((item, index) => (
                  <a 
                    key={index} 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 block"
                  >
                    <h4 className="font-semibold text-green-600 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-500 mt-1 truncate">{item.genre}</p>
                    <div className="mt-2 flex items-center text-xs text-green-700">
                      <Music className="mr-1 h-3 w-3" /> Open in Spotify
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={resetApp}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionAnalysisPage;