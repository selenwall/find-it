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
    dispatch 
  } = useGame();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
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
    if (timeLeft <= 0 && isGameActive) {
      endGame(false);
    }
  }, [timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    startTimer();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      dispatch({ type: 'UPDATE_TIME', payload: timeLeft - 1 });
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

  const endGame = (found) => {
    stopTimer();
    dispatch({ type: 'END_GAME' });
    
    if (found) {
      dispatch({ type: 'FOUND_OBJECT', payload: targetObject });
      const shareConfirmed = window.confirm(
        `Grattis! 🎉 Du hittade en ${targetObject.objectClass}! Du får 1 poäng! Vill du dela poängen?`
      );
      
      if (shareConfirmed) {
        shareScore();
      }
      
      navigate('/home');
    } else {
      alert(
        `Tiden är ute! ⏰ Du hittade inte en ${targetObject.objectClass} i tid. Bättre lycka nästa gång!`
      );
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
        const detection = await ObjectDetectionService.detectObjects(imageUrl);
        
        // Check if the detected object matches the target
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              {formatTime(timeLeft)}
            </div>
            <p><strong>Hitta en: {targetObject.objectClass}</strong></p>
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

      <div className="game-info">
        <p>{isProcessing ? 'Analyserar foto...' : 'Ta foto när du hittat objektet!'}</p>
      </div>
    </div>
  );
};

export default GameScreen;