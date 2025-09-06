import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SMSService from '../services/SMSService';

const HomeScreen = () => {
  const { currentPlayer, score, dispatch } = useGame();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(currentPlayer || '');
  const [friendName, setFriendName] = useState('');

  useEffect(() => {
    // Check for incoming game data from URL parameters
    const checkForIncomingGame = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const gameData = urlParams.get('game');
      if (gameData) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(gameData));
          if (parsedData.type === 'HITTA_GAME') {
            dispatch({
              type: 'START_GAME',
              payload: parsedData,
            });
            navigate('/game');
          }
        } catch (error) {
          console.error('Error parsing game data:', error);
        }
      }
    };
    checkForIncomingGame();
  }, [dispatch, navigate]);

  const handleSetPlayer = () => {
    if (playerName.trim()) {
      dispatch({ type: 'SET_PLAYER', payload: playerName.trim() });
      alert(`Välkommen ${playerName}!`);
    } else {
      alert('Ange ett namn');
    }
  };

  const handleStartNewGame = () => {
    if (!currentPlayer) {
      alert('Ange ditt namn först');
      return;
    }
    navigate('/camera');
  };

  const handleJoinGame = () => {
    if (!currentPlayer) {
      alert('Ange ditt namn först');
      return;
    }
    // Check for incoming game data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gameData = urlParams.get('game');
    if (gameData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(gameData));
        if (parsedData.type === 'HITTA_GAME') {
          dispatch({
            type: 'START_GAME',
            payload: parsedData,
          });
          navigate('/game');
        }
      } catch (error) {
        console.error('Error parsing game data:', error);
        alert('Kunde inte läsa speldata från länken');
      }
    } else {
      alert('Inget aktivt spel att gå med i. Kontrollera att du har en giltig spellänk.');
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <h1>🎯 Hitta!</h1>
        <p>Ta foto, dela, hitta!</p>
      </div>

      <div className="card">
        <h2>Spelare</h2>
        <input
          className="input"
          type="text"
          placeholder="Ange ditt namn"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          disabled={!!currentPlayer}
        />
        {!currentPlayer && (
          <button className="btn btn-primary" onClick={handleSetPlayer}>
            Sätt spelare
          </button>
        )}
        {currentPlayer && (
          <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            Spelare: {currentPlayer}
          </p>
        )}
      </div>

      <div className="card">
        <h2>Din poäng</h2>
        <div className="score-display">{score}</div>
      </div>

      <div className="card">
        <h2>Spela</h2>
        
        <button className="btn btn-primary btn-large" onClick={handleStartNewGame}>
          📸 Starta nytt spel
        </button>

        <button className="btn btn-secondary btn-large" onClick={handleJoinGame}>
          🎮 Gå med i spel
        </button>
      </div>

      <div className="card">
        <h2>Så här spelar du:</h2>
        <ol style={{ lineHeight: '1.6', color: '#666' }}>
          <li>Ta ett foto på ett objekt</li>
          <li>Objektet identifieras automatiskt</li>
          <li>Dela spelet via länk till en kompis</li>
          <li>Kompisen har 5 minuter att hitta samma typ av objekt</li>
          <li>Få poäng för varje objekt du hittar!</li>
        </ol>
      </div>
    </div>
  );
};

export default HomeScreen;