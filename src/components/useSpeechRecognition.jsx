import { useRef, useEffect, useState } from 'react';

const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const initSpeechRecognition = () => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setRecognitionError("Speech recognition is not supported in this browser.");
          return;
        }

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
          setIsRecording(false);
          setRecognitionError(`Speech recognition error: ${event.error}`);
        };

        recognition.onend = () => {
          if (isRecording) {
            recognition.start(); // Restart if still recording
          }
        };

        recognitionRef.current = recognition;
      } catch (error) {
        setRecognitionError(`Failed to initialize speech recognition: ${error.message}`);
      }
    };

    initSpeechRecognition();
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition on cleanup:", e);
        }
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setRecognitionError("Speech recognition not initialized.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        setAudioTranscript(''); // Clear transcript before starting
        recognitionRef.current.start();
        setIsRecording(true);
        setRecognitionError(null);
      } catch (error) {
        setIsRecording(false);
        setRecognitionError(`Could not start recording: ${error.message}`);
      }
    }
  };

  return {
    isRecording,
    audioTranscript,
    recognitionError,
    toggleRecording,
    setAudioTranscript
  };
};

export default useSpeechRecognition;