import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SMSService from '../services/SMSService';

const WaitingScreen = () => {
  const { 
    currentPlayer, 
    targetObject, 
    waitingForOpponent, 
    gameState,
    opponentScore,
    score,
    dispatch 
  } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    // If not waiting for opponent, redirect to home
    if (!waitingForOpponent) {
      navigate('/');
    }
  }, [waitingForOpponent, navigate]);

  const handleShareAgain = async () => {
    try {
      const success = await SMSService.shareGame(targetObject, currentPlayer);
      if (success) {
        alert('Spelet delades igen! 📱');
      }
    } catch (error) {
      console.error('Error sharing game again:', error);
      alert('Kunde inte dela spelet igen');
    }
  };

  const handleOpponentFound = () => {
    // Simulate opponent finding the object
    dispatch({ type: 'OPPONENT_FOUND_OBJECT' });
    navigate('/camera');
  };

  const handleCancelWaiting = () => {
    const confirmed = window.confirm(
      'Är du säker på att du vill avbryta väntan? Du kan inte avbryta förrän motspelaren har hittat objektet.'
    );
    if (confirmed) {
      dispatch({ type: 'END_GAME' });
      navigate('/');
    }
  };

  return (
    <div className="waiting-screen">
      <div className="waiting-container">
        <h1>⏳ Väntar på motspelare</h1>
        
        <div className="game-info">
          <h2>🎯 Ditt mål:</h2>
          <p className="target-object">{targetObject?.objectClass}</p>
        </div>

        <div className="scores">
          <div className="score-item">
            <span className="player-name">Du ({currentPlayer})</span>
            <span className="score">{score}</span>
          </div>
          <div className="score-item">
            <span className="player-name">Motspelare</span>
            <span className="score">{opponentScore}</span>
          </div>
        </div>

        <div className="waiting-message">
          <p>📱 Dela spelet med din kompis via SMS eller meddelanden</p>
          <p>⏰ Motspelaren har 5 minuter på sig att hitta objektet</p>
        </div>

        <div className="waiting-actions">
          <button 
            className="btn btn-primary"
            onClick={handleShareAgain}
          >
            📱 Dela spelet igen
          </button>
          
          <button 
            className="btn btn-success"
            onClick={handleOpponentFound}
          >
            🎉 Motspelaren hittade objektet!
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={handleCancelWaiting}
          >
            ❌ Avbryt väntan
          </button>
        </div>

        <div className="instructions">
          <h3>📋 Instruktioner:</h3>
          <ol>
            <li>Dela spelet med din kompis (du kan dela igen om det behövs)</li>
            <li>Vänta tills de hittar objektet</li>
            <li>När de hittar det, klicka "Motspelaren hittade objektet!"</li>
            <li>Nu är det din tur att hitta något!</li>
            <li><strong>Du kan inte avbryta väntan förrän motspelaren har hittat objektet</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen;