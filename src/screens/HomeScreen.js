import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SMSService from '../services/SMSService';

const HomeScreen = () => {
  const { player1, player2, gameOver, winner, dispatch } = useGame();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [hasGameLink, setHasGameLink] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Check for incoming game data from URL (supports hash routing)
    const checkForIncomingGame = () => {
      const fullUrl = window.location.href;
      const parsed = SMSService.parseGameData(fullUrl);
      if (parsed) {
        setHasGameLink(true);
        console.log('Game link detected:', parsed);
      } else {
        setHasGameLink(false);
      }
    };
    checkForIncomingGame();
  }, []);

  const handleStartNewGame = () => {
    if (!playerName.trim()) {
      alert('Ange ditt namn först');
      return;
    }
    dispatch({ type: 'SET_PLAYER1', payload: playerName.trim() });
    navigate('/camera');
  };

  const handleJoinGame = () => {
    if (isJoining) return;
    setIsJoining(true);
    
    if (!playerName.trim()) {
      alert('Ange ditt namn först');
      setIsJoining(false);
      return;
    }
    
    const parsedData = SMSService.parseGameData(window.location.href);
    if (parsedData && parsedData.type === 'HITTA_GAME') {
      const joinPayload = { ...parsedData, isJoining: true, playerName: playerName.trim() };
      dispatch({ type: 'SET_PLAYER2', payload: playerName.trim() });
      dispatch({ type: 'START_GAME', payload: joinPayload });
      navigate('/game');
      setIsJoining(false);
    } else {
      alert('Inget aktivt spel att gå med i. Kontrollera att du har en giltig spellänk.');
      setIsJoining(false);
    }
  };

  const handleResetGame = () => {
    const confirmed = window.confirm('Vill du återställa spelet och börja om?');
    if (confirmed) {
      dispatch({ type: 'RESET_GAME' });
      setPlayerName('');
    }
  };

  // Show game over screen
  if (gameOver) {
    const winnerName = winner === 'player1' ? player1.name : player2.name;
    return (
      <div className="home-container">
        <div className="header">
          <h1>🎉 Spelet är slut!</h1>
          <p>{winnerName} vann med 5 poäng!</p>
        </div>

        <div className="card">
          <h2>Slutresultat</h2>
          <div className="scores-display">
            <div className="score-item">
              <span className="player-name">{player1.name}</span>
              <span className="score">{player1.score}</span>
            </div>
            <div className="score-item">
              <span className="player-name">{player2.name}</span>
              <span className="score">{player2.score}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <button className="btn btn-primary btn-large" onClick={handleResetGame}>
            🔄 Spela igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="header">
        <h1>🎯 Hitta!</h1>
        <p>Första till 5 poäng vinner!</p>
      </div>

      {/* Show scores if players exist */}
      {(player1.name || player2.name) && (
        <div className="card">
          <h2>Poäng</h2>
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
      )}

      <div className="card">
        <h2>Ditt namn</h2>
        <input
          className="input"
          type="text"
          placeholder="Ange ditt namn"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>

      {!hasGameLink ? (
        <div className="card">
          <h2>Starta spel</h2>
          <p>Ta ett foto på ett objekt och dela med en kompis!</p>
          <button className="btn btn-primary btn-large" onClick={handleStartNewGame}>
            📸 Starta nytt spel
          </button>
        </div>
      ) : (
        <div className="card">
          <h2>Gå med i spel</h2>
          <p>Du har fått en spellänk!</p>
          <button className="btn btn-primary btn-large" onClick={handleJoinGame} disabled={isJoining}>
            {isJoining ? 'Ansluter…' : '🎮 Gå med i spel'}
          </button>
        </div>
      )}

      {(player1.name || player2.name) && (
        <div className="card">
          <button className="btn btn-secondary" onClick={handleResetGame}>
            🔄 Återställ spel
          </button>
        </div>
      )}

      <div className="card">
        <h2>Så spelar du:</h2>
        {!hasGameLink ? (
          <ol style={{ lineHeight: '1.6', color: '#666' }}>
            <li>Ta foto på ett objekt</li>
            <li>Välj objekt om flera hittas</li>
            <li>Dela spelet med en kompis</li>
            <li>Kompisen har 2 minuter att hitta samma typ av objekt</li>
            <li>Första till 5 poäng vinner!</li>
          </ol>
        ) : (
          <ol style={{ lineHeight: '1.6', color: '#666' }}>
            <li>Ange ditt namn och gå med</li>
            <li>Du har 2 minuter att hitta objektet</li>
            <li>Ta foto när du hittat det</li>
            <li>Första till 5 poäng vinner!</li>
          </ol>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;