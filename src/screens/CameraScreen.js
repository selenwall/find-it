import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import ObjectDetectionService from '../services/ObjectDetection';
import SMSService from '../services/SMSService';

const CameraScreen = () => {
  const { 
    currentPlayerName,
    player1,
    player2,
    isMyTurn,
    dispatch 
  } = useGame();
  
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [showObjectSelector, setShowObjectSelector] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await ObjectDetectionService.loadModel();
        if (mounted) {
          setIsModelLoading(false);
          await startCamera();
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
        if (mounted) {
          setIsModelLoading(false);
        }
      }
    };
    
    initialize();
    dispatch({ type: 'SET_CAMERA_ACTIVE', payload: true });
    
    return () => {
      mounted = false;
      stopCamera();
      dispatch({ type: 'SET_CAMERA_ACTIVE', payload: false });
    };
  }, [dispatch]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Kunde inte starta kameran. Kontrollera behörigheter.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takePicture = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );
      const imageUrl = URL.createObjectURL(blob);
      
      const detections = await ObjectDetectionService.detectObjects(imageUrl);
      
      if (Array.isArray(detections) && detections.length > 0) {
        setDetectedObjects(detections);
        setShowObjectSelector(true);
      } else if (detections && !Array.isArray(detections)) {
        // Ett objekt detekterat
        handleObjectSelect(detections);
      } else {
        alert('Inga objekt hittades. Försök igen!');
      }
      
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Error taking picture:', error);
      alert('Något gick fel. Försök igen!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleObjectSelect = async (selectedObject) => {
    setShowObjectSelector(false);
    setDetectedObjects([]);
    
    // Sätt objektet som mål
    dispatch({ type: 'SET_TARGET_OBJECT', payload: selectedObject });
    
    // Dela utmaningen
    const shared = await SMSService.shareChallenge(
      selectedObject,
      currentPlayerName,
      player1.score,
      player2.score
    );
    
    if (shared) {
      stopCamera();
      navigate('/');
    }
  };

  const handleCancel = () => {
    stopCamera();
    navigate('/');
  };

  if (isModelLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Förbereder kamera...</p>
      </div>
    );
  }

  return (
    <div className="camera-screen">
      <div className="camera-header">
        <button className="back-btn" onClick={handleCancel}>
          ← Tillbaka
        </button>
        <div className="camera-score">
          {player1.name}: {player1.score} - {player2.name || '?'}: {player2.score}
        </div>
      </div>

      <div className="camera-viewport">
        <video
          ref={videoRef}
          className="camera-feed"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        <div className="camera-instruction">
          Fotografera ett objekt
        </div>
      </div>

      <div className="camera-controls">
        <button
          className={`capture-btn ${isProcessing ? 'processing' : ''}`}
          onClick={takePicture}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="mini-spinner"></div>
          ) : (
            <div className="capture-icon"></div>
          )}
        </button>
      </div>

      {showObjectSelector && (
        <div className="modal-overlay">
          <div className="object-selector-modal">
            <h3>Välj objekt att skicka:</h3>
            <div className="objects-grid">
              {detectedObjects.map((obj, index) => (
                <button
                  key={index}
                  className="object-card"
                  onClick={() => handleObjectSelect(obj)}
                >
                  <div className="object-name">{obj.objectClass}</div>
                  <div className="object-confidence">
                    {Math.round(obj.confidence * 100)}%
                  </div>
                </button>
              ))}
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowObjectSelector(false);
                setDetectedObjects([]);
              }}
            >
              Ta om foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraScreen;