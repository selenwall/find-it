import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SMSService from '../services/SMSService';

const HomeScreen = () => {
  const { 
    currentPlayerName, 
    player1, 
    player2, 
    gameActive,
    winner,
    dispatch 
  } = useGame();
  
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(currentPlayerName || '');
  const [hasGameLink, setHasGameLink] = useState(false);
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    // Kolla om det finns en spellänk i URL:en
    const checkForGameLink = () => {
      const fullUrl = window.location.href;
      const parsed = SMSService.parseGameData(fullUrl);
      if (parsed) {
        setHasGameLink(true);
        setGameData(parsed);
      }
    };
    checkForGameLink();
  }, []);

  const handleStartNewGame = () => {
    const name = playerName.trim() || currentPlayerName;
    if (!name) {
      alert('Ange ditt namn först!');
      return;
    }
    
    dispatch({ type: 'SET_PLAYER_NAME', payload: name });
    dispatch({ type: 'START_NEW_GAME' });
    navigate('/camera');
  };

  const handleJoinGame = () => {
    const name = playerName.trim() || currentPlayerName;
    if (!name) {
      alert('Ange ditt namn först!');
      return;
    }
    
    if (!gameData) {
      alert('Ingen giltig spellänk hittades!');
      return;
    }
    
    dispatch({ type: 'SET_PLAYER_NAME', payload: name });
    dispatch({ 
      type: 'JOIN_GAME', 
      payload: {
        ...gameData,
        player2Name: name
      }
    });
    navigate('/game');
  };

  const handleNameSubmit = () => {
    const name = playerName.trim();
    if (!name) {
      alert('Ange ett namn!');
      return;
    }
    dispatch({ type: 'SET_PLAYER_NAME', payload: name });
  };

  return (
    <div className="home-screen">
      <div className="header-compact">
        <h1>🎯 Hitta!</h1>
        {gameActive && (
          <div className="score-bar">
            <div className="score-item">
              <span>{player1.name || 'Spelare 1'}</span>
              <span className="score-value">{player1.score}</span>
            </div>
            <div className="score-divider">-</div>
            <div className="score-item">
              <span>{player2.name || 'Spelare 2'}</span>
              <span className="score-value">{player2.score}</span>
            </div>
          </div>
        )}
      </div>

      {winner && (
        <div className="winner-banner">
          <h2>🏆 {winner === 'player1' ? player1.name : player2.name} vann!</h2>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'RESET_GAME' })}
          >
            Nytt spel
          </button>
        </div>
      )}

      <div className="main-content">
        {!currentPlayerName ? (
          <div className="name-input-card">
            <h2>Vad heter du?</h2>
            <input
              type="text"
              className="input-field"
              placeholder="Ditt namn"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              maxLength={20}
              autoFocus
            />
            <button 
              className="btn btn-primary btn-full"
              onClick={handleNameSubmit}
            >
              Fortsätt
            </button>
          </div>
        ) : (
          <>
            <div className="welcome-text">
              Hej {currentPlayerName}! 👋
            </div>

            {hasGameLink && gameData ? (
              <div className="action-card">
                <h2>Du har en utmaning!</h2>
                <div className="challenge-info">
                  <p>Från: {gameData.player1Name}</p>
                  <p className="object-highlight">
                    Hitta: {gameData.targetObject.objectClass}
                  </p>
                  <p className="time-info">⏱️ 2 minuter</p>
                </div>
                <button 
                  className="btn btn-primary btn-full"
                  onClick={handleJoinGame}
                >
                  Acceptera utmaning
                </button>
              </div>
            ) : (
              <div className="action-card">
                <h2>Starta nytt spel</h2>
                <p>Fotografera något och utmana en vän!</p>
                <button 
                  className="btn btn-primary btn-full"
                  onClick={handleStartNewGame}
                >
                  📸 Ta foto
                </button>
              </div>
            )}

            {gameActive && !hasGameLink && (
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/game')}
              >
                Fortsätt spel
              </button>
            )}
          </>
        )}

        <div className="rules-mini">
          <p>Först till 5 poäng vinner! 🏆</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;