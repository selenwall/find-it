import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import ObjectDetectionService from '../services/ObjectDetection';
import SMSService from '../services/SMSService';

const CameraScreen = () => {
  const { currentPlayer, dispatch } = useGame();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedObject, setDetectedObject] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [showObjectSelector, setShowObjectSelector] = useState(false);
  const [stream, setStream] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    // Initialize object detection service
    const initializeAI = async () => {
      try {
        await ObjectDetectionService.loadModel();
        setIsModelLoading(false);
        console.log('AI model ready');
      } catch (error) {
        console.error('Failed to load AI model:', error);
        setIsModelLoading(false);
      }
    };
    
    initializeAI();
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Kunde inte komma åt kameran. Kontrollera behörigheter.');
    }
  };

  const takePicture = async () => {
    if (videoRef.current && canvasRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        const imageUrl = URL.createObjectURL(blob);
        
        // Detect objects in the image
        const detections = await ObjectDetectionService.detectObjects(imageUrl);
        
        if (Array.isArray(detections)) {
          // Multiple objects detected
          setDetectedObjects(detections);
          setShowObjectSelector(true);
        } else {
          // Single object detected
          setDetectedObject(detections);
          setDetectedObjects([detections]);
          
          const confirmed = window.confirm(
            `Jag hittade en ${detections.objectClass} (${Math.round(detections.confidence * 100)}% säker). Vill du dela spelet?`
          );
          
          if (confirmed) {
            await shareGame(detections);
          } else {
            setDetectedObject(null);
            setDetectedObjects([]);
          }
        }
        
        // Clean up
        URL.revokeObjectURL(imageUrl);
      } catch (error) {
        console.error('Error taking picture:', error);
        alert('Kunde inte ta foto');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const shareGame = async (object) => {
    try {
      const success = await SMSService.shareGame(object, currentPlayer);
      if (success) {
        // Start the game for the current player
        dispatch({
          type: 'START_GAME',
          payload: {
            targetObject: object,
            playerName: currentPlayer,
            timestamp: Date.now(),
          },
        });
        navigate('/game');
      }
    } catch (error) {
      console.error('Error sharing game:', error);
      alert('Kunde inte dela spelet');
    }
  };

  const handleObjectSelect = async (selectedObject) => {
    setDetectedObject(selectedObject);
    setShowObjectSelector(false);
    
    const confirmed = window.confirm(
      `Du valde: ${selectedObject.objectClass} (${Math.round(selectedObject.confidence * 100)}% säker). Vill du dela spelet?`
    );
    
    if (confirmed) {
      await shareGame(selectedObject);
    } else {
      setDetectedObject(null);
      setDetectedObjects([]);
    }
  };

  const handleCancelSelection = () => {
    setShowObjectSelector(false);
    setDetectedObjects([]);
    setDetectedObject(null);
  };

  if (isModelLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Laddar AI-modell...</p>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>Detta kan ta några sekunder första gången</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Analyserar foto med AI...</p>
      </div>
    );
  }

  return (
    <div className="camera-screen">
      <div className="camera-container">
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        <div className="camera-overlay">
          <div className="camera-top">
            <p>Rikta kameran mot ett objekt</p>
          </div>
          
          <div className="camera-bottom">
            <button
              className="capture-button"
              onClick={takePicture}
              disabled={isProcessing}
            >
              <div className="capture-button-inner"></div>
            </button>
          </div>
        </div>
      </div>

      {showObjectSelector && (
        <div className="object-selector-overlay">
          <div className="object-selector">
            <h3>Välj objekt att skicka:</h3>
            <div className="object-list">
              {detectedObjects.map((obj, index) => (
                <div 
                  key={index} 
                  className="object-option"
                  onClick={() => handleObjectSelect(obj)}
                >
                  <div className="object-info">
                    <span className="object-name">{obj.objectClass}</span>
                    <span className="object-confidence">
                      {Math.round(obj.confidence * 100)}% säker
                    </span>
                  </div>
                  <div className="object-arrow">→</div>
                </div>
              ))}
            </div>
            <div className="object-selector-actions">
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelSelection}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {detectedObject && !showObjectSelector && (
        <div className="game-info">
          <p><strong>Objekt:</strong> {detectedObject.objectClass}</p>
          <p><strong>Säkerhet:</strong> {Math.round(detectedObject.confidence * 100)}%</p>
        </div>
      )}
    </div>
  );
};

export default CameraScreen;