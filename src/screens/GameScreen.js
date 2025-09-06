import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import ObjectDetectionService from '../services/ObjectDetection';
import SMSService from '../services/SMSService';

const GameScreen = () => {
  const { 
    currentGame, 
    targetObject, 
    timeLeft, 
    isGameActive, 
    score,
    player1,
    player2,
    dispatch 
  } = useGame();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [localTimeLeft, setLocalTimeLeft] = useState(300);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [showObjectSelector, setShowObjectSelector] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        await ObjectDetectionService.loadModel();
        setIsModelLoading(false);
        console.log('AI model ready for game');
      } catch (error) {
        console.error('Failed to load AI model:', error);
        setIsModelLoading(false);
      }
    };
    
    initializeAI();
    
    if (isGameActive && !gameStarted) {
      startGame();
      startCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isGameActive]);

  useEffect(() => {
    if (localTimeLeft <= 0 && isGameActive) {
      endGame(false);
    }
  }, [localTimeLeft]);

  // Start camera when component mounts and game is active
  useEffect(() => {
    console.log('GameScreen: isGameActive =', isGameActive, 'isModelLoading =', isModelLoading);
    if (isGameActive && !isModelLoading) {
      console.log('GameScreen: Starting camera...');
      startCamera();
    }
  }, [isGameActive, isModelLoading]);

  // Also start camera when component mounts (for navigation from other screens)
  useEffect(() => {
    if (!isModelLoading && isGameActive) {
      // Small delay to ensure video element is ready
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setLocalTimeLeft(300); // Reset timer to 5 minutes
    startTimer();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setLocalTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      console.log('GameScreen: Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      console.log('GameScreen: Camera access granted');
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('GameScreen: Video element updated with stream');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Kunde inte komma åt kameran. Kontrollera behörigheter.');
    }
  };

  const endGame = (found) => {
    stopTimer();
    
    if (found) {
      dispatch({ type: 'FOUND_OBJECT', payload: targetObject });
      const shareConfirmed = window.confirm(
        `Grattis! 🎉 Du hittade en ${targetObject.objectClass}! Du får 1 poäng! Vill du dela poängen?`
      );
      
      if (shareConfirmed) {
        shareScore();
      }
      
      // After finding object, it's now your turn to find something new
      dispatch({ type: 'END_GAME' });
      navigate('/camera');
    } else {
      alert(
        `Tiden är ute! ⏰ Du hittade inte en ${targetObject.objectClass} i tid. Bättre lycka nästa gång!`
      );
      dispatch({ type: 'END_GAME' });
      navigate('/home');
    }
  };

  const shareScore = async () => {
    try {
      await SMSService.shareScore(currentGame.playerName, score + 1, targetObject);
    } catch (error) {
      console.error('Error sharing score:', error);
    }
  };

  const takePicture = async () => {
    if (videoRef.current && canvasRef.current && !isProcessing && isGameActive) {
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
          // Multiple objects detected - show selector
          setDetectedObjects(detections);
          setShowObjectSelector(true);
        } else {
          // Single object detected - check match directly
          const detection = detections;
          const isMatch = await ObjectDetectionService.matchObjects(targetObject, detection);
          
          if (isMatch) {
            const confirmed = window.confirm(
              `Match! 🎯 Du hittade en ${detection.objectClass}! Det matchar målet!`
            );
            if (confirmed) {
              endGame(true);
            }
          } else {
            alert(
              `Inte rätt objekt. Du hittade en ${detection.objectClass}, men du letar efter en ${targetObject.objectClass}.`
            );
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

  const handleObjectSelect = async (selectedObject) => {
    setShowObjectSelector(false);
    
    // Check if the selected object matches the target
    const isMatch = await ObjectDetectionService.matchObjects(targetObject, selectedObject);
    
    if (isMatch) {
      const confirmed = window.confirm(
        `Match! 🎯 Du valde en ${selectedObject.objectClass}! Det matchar målet!`
      );
      if (confirmed) {
        endGame(true);
      }
    } else {
      alert(
        `Inte rätt objekt. Du valde en ${selectedObject.objectClass}, men du letar efter en ${targetObject.objectClass}.`
      );
    }
    
    setDetectedObjects([]);
  };

  const handleCancelSelection = () => {
    setShowObjectSelector(false);
    setDetectedObjects([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isModelLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Laddar AI-modell...</p>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>Förbereder objektigenkänning...</p>
      </div>
    );
  }

  if (!isGameActive) {
    return (
      <div className="card" style={{ textAlign: 'center', margin: '2rem' }}>
        <h2>Inget aktivt spel</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Tillbaka till start
        </button>
      </div>
    );
  }

  return (
    <div className="game-screen">
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
            <div className="timer">
              {formatTime(localTimeLeft)}
            </div>
            <p><strong>Hitta en: {targetObject.objectClass}</strong></p>
            <div className="scores-display">
              <div className="score-item">
                <span className="player-name">{player1.name || 'Spelare 1'}</span>
                <span className="score">{player1.score}</span>
              </div>
              <div className="score-item">
                <span className="player-name">{player2.name || 'Spelare 2'}</span>
                <span className="score">{player2.score}</span>
              </div>
            </div>
          </div>
          
          <div className="camera-bottom">
            <button
              className={`capture-button ${(!isGameActive || isProcessing) ? 'disabled' : ''}`}
              onClick={takePicture}
              disabled={!isGameActive || isProcessing}
            >
              {isProcessing ? (
                <div className="loading-spinner" style={{ width: '30px', height: '30px' }}></div>
              ) : (
                <div className="capture-button-inner"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {showObjectSelector && (
        <div className="object-selector-overlay">
          <div className="object-selector">
            <h3>Välj objekt att kontrollera:</h3>
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

      <div className="game-info">
        <p>{isProcessing ? 'Analyserar foto...' : 'Ta foto när du hittat objektet!'}</p>
        {stream && (
          <p className="camera-status">📹 Kameran är igång - leta efter objektet!</p>
        )}
      </div>
    </div>
  );
};

export default GameScreen;