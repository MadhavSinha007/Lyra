import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, Heart, Music, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const EmotionAnalysisPage = () => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [userText, setUserText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);

  // Emotion labels mapped to face-api expressions
  const EMOTIONS = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful'];

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setModelLoading(true);
        
        // Set the models path 
        const MODEL_URL = '/models';
        
        // Load required face-api models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        console.log('Face-api.js models loaded successfully');
        setModelsLoaded(true);
        setModelLoading(false);
      } catch (error) {
        console.error("Error loading face-api models:", error);
        setModelLoading(false);
        alert("Error loading face detection models. Please try refreshing the page.");
      }
    };

    loadModels();

    // Initialize speech recognition
    try {
      if (window.SpeechRecognition) {
        recognitionRef.current = new window.SpeechRecognition();
      } else if (window.webkitSpeechRecognition) {
        recognitionRef.current = new window.webkitSpeechRecognition();
      } else {
        console.warn("Speech recognition not supported in this browser");
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setAudioTranscript(transcript);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };
      }
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
    }

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping speech recognition:", e);
        }
      }
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser doesn't support camera access or it's blocked");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Make sure video autoplay works using a promise
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(resolve)
              .catch(e => {
                console.error("Error playing video:", e);
                alert("Error accessing camera. Please check browser permissions.");
                reject(e);
              });
          };
          
          // Timeout in case onloadedmetadata never fires
          setTimeout(() => {
            if (videoRef.current.readyState >= 2) {
              videoRef.current.play()
                .then(resolve)
                .catch(reject);
            } else {
              reject(new Error("Video metadata loading timeout"));
            }
          }, 3000);
        });
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert(`Camera access error: ${err.message}. Please check your browser permissions.`);
    }
  };

  // Capture image and detect emotion
  const captureAndPredict = async () => {
    if (!videoRef.current || !modelsLoaded || !canvasRef.current) {
      alert("Camera or models not ready. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video is playing and has dimensions
      if (video.paused || video.videoWidth === 0 || video.videoHeight === 0) {
        await video.play();
        // Short delay to ensure video is ready
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw current video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Save the image first before proceeding
      const capturedImage = canvas.toDataURL('image/jpeg');
      setImage(capturedImage);
      
      // Detect face and expressions
      const detections = await faceapi.detectSingleFace(
        video, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceExpressions();
      
      if (detections) {
        // Get the dominant expression
        const expressions = detections.expressions;
        console.log("Detected expressions:", expressions);
        
        let dominantExpression = Object.keys(expressions).reduce(
          (a, b) => expressions[a] > expressions[b] ? a : b
        );
        
        // Map face-api expressions to our emotion labels
        const expressionMap = {
          'happy': 'happy',
          'sad': 'sad', 
          'angry': 'angry',
          'neutral': 'neutral',
          'surprised': 'surprised',
          'fearful': 'fearful',
          'disgusted': 'angry' // Map disgusted to angry since it's close
        };
        
        const mappedEmotion = expressionMap[dominantExpression] || 'neutral';
        setEmotion(mappedEmotion);
        
        // Draw expression results on canvas (optional - for visualization)
        context.font = '16px Arial';
        context.fillStyle = 'red';
        context.fillText(`Emotion: ${mappedEmotion}`, 10, 30);
      } else {
        // No face detected
        console.log("No face detected in the image");
        alert("No face detected. Please ensure your face is clearly visible.");
        setEmotion('neutral'); // Default to neutral if no face found
      }
    } catch (error) {
      console.error("Error in capture and predict:", error);
      alert("Error processing image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle voice recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser. Try Chrome or Edge.');
      return;
    }

    try {
      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Error toggling speech recognition:", error);
      setIsRecording(false);
      alert("Error with speech recognition. Please try again.");
    }
  };

  // Submit for analysis
  const submitForAnalysis = async () => {
    setIsLoading(true);
    try {
      // Combine visual and text input for better analysis
      const inputText = userText || audioTranscript || "";
      const combinedInput = `Visual emotion: ${emotion || 'unknown'}. User description: ${inputText}`;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple response logic based on combined input
      let response = "Thank you for sharing how you're feeling.";
      if (combinedInput.toLowerCase().includes('happy') || combinedInput.toLowerCase().includes('good')) {
        response = "I'm glad to see you're feeling positive! Keep up the good mood!";
      } else if (combinedInput.toLowerCase().includes('sad') || combinedInput.toLowerCase().includes('bad')) {
        response = "I notice you might be feeling down. Remember that tough times pass.";
      } else if (combinedInput.toLowerCase().includes('angry') || combinedInput.toLowerCase().includes('mad')) {
        response = "I sense some frustration. Let's take some deep breaths together.";
      } else if (combinedInput.toLowerCase().includes('neutral')) {
        response = "You seem to be in a balanced state right now.";
      } else if (combinedInput.toLowerCase().includes('surprised')) {
        response = "Something seems to have caught you by surprise!";
      } else if (combinedInput.toLowerCase().includes('fearful')) {
        response = "I sense some anxiety or fear. Remember that you're safe right now.";
      }
      
      setAiResponse(response);
      setStep(3);
    } catch (error) {
      console.error("Error:", error);
      setAiResponse("We encountered an error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Breathing exercises
  const breathingExercises = [
    {
      name: "Box Breathing",
      steps: ["Breathe in for 4", "Hold for 4", "Exhale for 4", "Wait for 4"],
      duration: "5 minutes"
    },
    {
      name: "4-7-8 Breathing",
      steps: ["Breathe in for 4", "Hold for 7", "Exhale for 8"],
      duration: "4 cycles"
    }
  ];

  // Music recommendations
  const musicRecommendations = {
    happy: ["Upbeat Pop", "Dance Mix", "Cheerful Indie"],
    sad: ["Calming Piano", "Soothing Strings", "Acoustic Ballads"],
    angry: ["Nature Sounds", "Classical", "Ambient Soundscapes"],
    neutral: ["Chill Vibes", "Ambient", "Lo-fi Beats"],
    surprised: ["Instrumental", "Cinematic", "New Age"],
    fearful: ["Meditation", "White Noise", "Gentle Classical"]
  };

  // Safe fallback for music recommendations
  const getMusicRecommendations = () => {
    if (emotion && musicRecommendations[emotion]) {
      return musicRecommendations[emotion];
    }
    return ["Calming Piano", "Ambient Sounds", "Nature Music"];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Emotion Wellness Check</h1>
          <p className="text-lg text-gray-600">
            Share how you're feeling through images, voice, or text
          </p>
        </div>

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

        {/* Step 1: Expression Capture */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Camera className="mr-2" /> Capture Your Expression
            </h2>
            
            <div className="mb-6">
              {!videoStream ? (
                <div className="bg-gray-100 aspect-video flex items-center justify-center rounded-lg">
                  <button 
                    onClick={startCamera}
                    disabled={modelLoading}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg flex items-center disabled:bg-gray-300"
                  >
                    <Camera className="mr-2" /> 
                    {modelLoading ? 'Loading Models...' : 'Enable Camera'}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg border border-gray-200"
                  />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-4">
              {videoStream && (
                <button
                  onClick={captureAndPredict}
                  disabled={isLoading || !modelsLoaded}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-blue-300"
                >
                  {isLoading ? 'Processing...' : 'Capture & Analyze'}
                </button>
              )}
              
              <button
                onClick={() => setStep(2)}
                className={`px-6 py-2 rounded-lg ${emotion ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {emotion ? 'Next' : 'Skip to Text Input'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2 and 3 remain the same as in your original code */}
        {/* ... Rest of your component remains unchanged ... */}
        
        {/* Step 2: Description */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold mb-6">Describe Your Feelings</h2>
            
            {image && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={image} 
                  alt="Captured expression" 
                  className="h-32 rounded-lg border border-gray-200"
                />
                {emotion && (
                  <div className="ml-4 self-center bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                    Detected: {emotion}
                  </div>
                )}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="feeling" className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling today?
              </label>
              <textarea
                id="feeling"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                placeholder="I'm feeling..."
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Or speak your feelings
                </label>
                <button
                  onClick={toggleRecording}
                  className={`flex items-center text-sm ${isRecording ? 'text-red-500' : 'text-teal-600'}`}
                >
                  <Mic className="mr-1 h-4 w-4" />
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg min-h-12">
                {audioTranscript || "Your speech will appear here..."}
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
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg flex items-center ${
                  isLoading || (!userText && !audioTranscript && !emotion) 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                {isLoading ? 'Analyzing...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold mb-6">Your Wellness Recommendations</h2>
            
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Analysis</h3>
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
                <Music className="mr-2 text-yellow-500" /> Music Suggestions
              </h3>
              <div className="flex flex-wrap gap-2">
                {getMusicRecommendations().map((genre, index) => (
                  <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  setStep(1);
                  setEmotion(null);
                  setUserText('');
                  setAiResponse('');
                  setImage(null);
                  setAudioTranscript('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmotionAnalysisPage;