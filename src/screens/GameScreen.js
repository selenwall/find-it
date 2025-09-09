import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import ObjectDetectionService from '../services/ObjectDetection';
import SMSService from '../services/SMSService';

const GameScreen = () => {
  const { 
    targetObject,
    timeLeft,
    player1,
    player2,
    currentPlayerName,
    isPlayer1,
    winner,
    dispatch 
  } = useGame();
  
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [localTimeLeft, setLocalTimeLeft] = useState(120);
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
          startTimer();
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
      stopTimer();
      dispatch({ type: 'SET_CAMERA_ACTIVE', payload: false });
    };
  }, [dispatch]);

  useEffect(() => {
    if (localTimeLeft <= 0) {
      handleTimeOut();
    }
  }, [localTimeLeft]);

  useEffect(() => {
    if (winner) {
      stopCamera();
      stopTimer();
      const winnerName = winner === 'player1' ? player1.name : player2.name;
      SMSService.shareWinner(winnerName, player1.score, player2.score);
      alert(`🏆 ${winnerName} vann med 5 poäng!`);
      navigate('/');
    }
  }, [winner, player1, player2, navigate]);

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
      alert('Kunde inte starta kameran.');
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

  const startTimer = () => {
    setLocalTimeLeft(120);
    timerRef.current = setInterval(() => {
      setLocalTimeLeft(prev => {
        if (prev <= 1) {
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

  const handleTimeOut = () => {
    stopTimer();
    stopCamera();
    dispatch({ type: 'TIME_OUT' });
    alert(`⏰ Tiden är ute! Du hittade inte ${targetObject?.objectClass} i tid.`);
    
    // Dela att tiden gick ut
    SMSService.shareFoundObject(
      currentPlayerName,
      player1.score,
      player2.score,
      { objectClass: 'inget (tiden gick ut)' }
    );
    
    navigate('/camera');
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
        checkObject(detections);
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

  const checkObject = async (selectedObject) => {
    setShowObjectSelector(false);
    setDetectedObjects([]);
    
    const isMatch = await ObjectDetectionService.matchObjects(
      targetObject,
      selectedObject
    );
    
    if (isMatch) {
      stopTimer();
      stopCamera();
      
      dispatch({ type: 'OBJECT_FOUND' });
      
      // Dela poäng
      const newScore = isPlayer1 ? player1.score + 1 : player2.score + 1;
      await SMSService.shareFoundObject(
        currentPlayerName,
        isPlayer1 ? newScore : player1.score,
        !isPlayer1 ? newScore : player2.score,
        selectedObject
      );
      
      if (newScore >= 5) {
        // Spelet är slut, vinnare krönt
        return;
      }
      
      alert(`🎉 Rätt! Du hittade ${selectedObject.objectClass}! Nu är det din tur att fotografera.`);
      navigate('/camera');
    } else {
      alert(`Det var ${selectedObject.objectClass}, inte ${targetObject.objectClass}. Försök igen!`);
    }
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
        <p>Förbereder...</p>
      </div>
    );
  }

  if (!targetObject) {
    return (
      <div className="error-screen">
        <h2>Inget objekt att hitta</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Tillbaka
        </button>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className={`timer ${localTimeLeft < 30 ? 'timer-warning' : ''}`}>
          {formatTime(localTimeLeft)}
        </div>
        <div className="target-display">
          Hitta: <strong>{targetObject.objectClass}</strong>
        </div>
        <div className="game-score">
          {player1.score} - {player2.score}
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
            <h3>Välj vilket objekt du fotograferade:</h3>
            <div className="objects-grid">
              {detectedObjects.map((obj, index) => (
                <button
                  key={index}
                  className="object-card"
                  onClick={() => checkObject(obj)}
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

export default GameScreen;