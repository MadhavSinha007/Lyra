import { useState, useEffect, useRef } from 'react';

const useCamera = () => {
  const [videoStream, setVideoStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [image, setImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    if (!videoRef.current) {
      setCameraError("Video element not initialized. Please wait and try again.");
      return;
    }

    try {
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setVideoStream(stream);

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch((err) => {
          setCameraError("Failed to play video stream.");
        });
      };
    } catch (err) {
      setCameraError(`Camera access failed: ${err.message} (Code: ${err.name})`);
    }
  };

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      setCameraError("Video or canvas not ready.");
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError("Unable to get canvas context.");
      return null;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setImage(imageDataUrl);
    setShowCanvas(true);

    return imageDataUrl;
  };

  return {
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
  };
};

export default useCamera;

