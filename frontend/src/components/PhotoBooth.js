import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PhotoBooth = ({ setCapturedImages }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImages, setImages] = useState([]);
  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Audio refs for sound effects
  const countdownSoundRef = useRef(null);
  const shutterSoundRef = useRef(null);

  useEffect(() => {
    // Load sound effects
    countdownSoundRef.current = new Audio('/beep_once.wav');
    shutterSoundRef.current = new Audio('/shutter.mp3');

    // Preload audio
    countdownSoundRef.current.load();
    shutterSoundRef.current.load();
  }, []);

  useEffect(() => {
    startCamera();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        startCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Start Camera
  const startCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        return;
      }
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error("Error playing video:", err));

        videoRef.current.style.transform = "scaleX(-1)";
        videoRef.current.style.objectFit = "cover";
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Countdown to take 4 pictures automatically
  const startCountdown = () => {
    if (capturing) return;
    setCapturing(true);

    let photosTaken = 0;
    const newCapturedImages = [];

    const captureSequence = async () => {
      if (photosTaken >= 4) {
        setCountdown(null);
        setCapturing(false);
        setSessionComplete(true);

        setCapturedImages([...newCapturedImages]);
        setImages([...newCapturedImages]);

        return;
      }

      let timeLeft = 5;
      setCountdown(timeLeft);

      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        // Play countdown beep sound
        if (timeLeft > 0 && countdownSoundRef.current) {
          countdownSoundRef.current.currentTime = 0;
          countdownSoundRef.current.play().catch(err => console.log("Audio play error:", err));
        }

        if (timeLeft === 0) {
          clearInterval(timer);

          // Play shutter sound
          if (shutterSoundRef.current) {
            shutterSoundRef.current.currentTime = 0;
            shutterSoundRef.current.play().catch(err => console.log("Audio play error:", err));
          }

          const imageUrl = capturePhoto();
          if (imageUrl) {
            newCapturedImages.push(imageUrl);
            setImages((prevImages) => [...prevImages, imageUrl]);
          }
          photosTaken += 1;
          setTimeout(captureSequence, 1000);
        }
      }, 1000);
    };

    captureSequence();
  };

  // Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");

      const targetWidth = 1280;
      const targetHeight = 720;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = targetWidth / targetHeight;

      let drawWidth = video.videoWidth;
      let drawHeight = video.videoHeight;
      let startX = 0;
      let startY = 0;

      if (videoRatio > targetRatio) {
        drawWidth = drawHeight * targetRatio;
        startX = (video.videoWidth - drawWidth) / 2;
      } else {
        drawHeight = drawWidth / targetRatio;
        startY = (video.videoHeight - drawHeight) / 2;
      }

      // Flip canvas for mirroring
      context.save();
      context.translate(canvas.width, 0);
      context.scale(-1, 1);

      context.drawImage(
        video,
        startX, startY, drawWidth, drawHeight,
        0, 0, targetWidth, targetHeight
      );
      context.restore();

      if (filter !== 'none') {
        context.filter = filter;
        context.drawImage(canvas, 0, 0);
        context.filter = 'none';
      }

      return canvas.toDataURL("image/png");
    }
  };

  // Replace specific photo
  const replacePhoto = (index) => {
    if (!sessionComplete) return;

    // Clear the selected photo immediately
    const updatedImages = [...capturedImages];
    updatedImages[index] = null; // Set to null temporarily
    setImages(updatedImages);

    setSessionComplete(false);
    setCapturing(true);

    let timeLeft = 5;
    setCountdown(timeLeft);

    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      // Play countdown beep sound
      if (timeLeft > 0 && countdownSoundRef.current) {
        countdownSoundRef.current.currentTime = 0;
        countdownSoundRef.current.play().catch(err => console.log("Audio play error:", err));
      }

      if (timeLeft === 0) {
        clearInterval(timer);

        // Play shutter sound
        if (shutterSoundRef.current) {
          shutterSoundRef.current.currentTime = 0;
          shutterSoundRef.current.play().catch(err => console.log("Audio play error:", err));
        }

        const imageUrl = capturePhoto();
        if (imageUrl) {
          const newImages = [...capturedImages];
          newImages[index] = imageUrl;
          setImages(newImages);
          setCapturedImages(newImages);
        }
        setCountdown(null);
        setCapturing(false);
        setSessionComplete(true);
      }
    }, 1000);
  };

  return (
    <div className="photo-booth">
      {countdown !== null && <h2 className="countdown animate">{countdown}</h2>}

      {sessionComplete && (
        <div style={{
          backgroundColor: '#ffe4e1',
          padding: '10px 20px',
          borderRadius: '10px',
          marginBottom: '15px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#ff69b4'
        }}>
          ✨ Klik salah satu foto di samping untuk menggantinya! ✨
        </div>
      )}

      <div className="photo-container">
        <div className="camera-container">
          <video ref={videoRef} autoPlay className="video-feed" style={{ filter }} />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="preview-side">
          {capturedImages.map((image, index) => (
            <div
              key={index}
              style={{ position: 'relative', cursor: sessionComplete ? 'pointer' : 'default' }}
              onClick={() => sessionComplete && replacePhoto(index)}
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt={`Captured ${index + 1}`}
                    className="side-preview"
                    style={{
                      opacity: sessionComplete ? 0.9 : 1,
                      transition: 'opacity 0.3s'
                    }}
                  />
                  {sessionComplete && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(255, 105, 180, 0.8)',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      opacity: 0,
                      transition: 'opacity 0.3s'
                    }}
                      className="replace-hint"
                    >
                      GANTI
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="side-preview"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#ff69b4'
                  }}
                >
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="controls">
        {!sessionComplete ? (
          <button onClick={startCountdown} disabled={capturing}>
            {capturing ? "Capturing..." : "Start Capture :)"}
          </button>
        ) : (
          <button
            onClick={() => navigate("/preview")}
            style={{
              backgroundColor: '#ff69b4',
              color: 'white',
              fontSize: '1.1rem',
              padding: '12px 30px',
              fontWeight: 'bold'
            }}
          >
            ✓ Lanjut ke Preview
          </button>
        )}
      </div>

      {!capturing && !sessionComplete && (
        <div className="filters">
          <button onClick={() => setFilter("none")}>No Filter</button>
          <button onClick={() => setFilter("grayscale(100%)")}>Grayscale</button>
          <button onClick={() => setFilter("sepia(100%)")}>Sepia</button>
          <button onClick={() => setFilter("grayscale(100%) contrast(120%) brightness(110%) sepia(30%) hue-rotate(10deg) blur(0.4px)")}>Vintage</button>
          <button onClick={() => setFilter("brightness(130%) contrast(105%) saturate(80%) blur(0.3px)")}>Soft</button>
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;
