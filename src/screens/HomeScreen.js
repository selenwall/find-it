import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SMSService from '../services/SMSService';

const HomeScreen = () => {
  const { currentPlayer, score, player1, player2, dispatch } = useGame();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(currentPlayer || '');
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

  const handleSetPlayer = () => {
    if (playerName.trim()) {
      dispatch({ type: 'SET_PLAYER', payload: playerName.trim() });
      alert(`Välkommen ${playerName}!`);
    } else {
      alert('Ange ett namn');
    }
  };

  const handleStartNewGame = () => {
    const effectiveName = currentPlayer || playerName.trim();
    if (!effectiveName) {
      alert('Ange ditt namn först');
      return;
    }
    if (!currentPlayer) {
      dispatch({ type: 'SET_PLAYER', payload: effectiveName });
    }
    dispatch({ type: 'SET_PLAYER1', payload: effectiveName });
    navigate('/camera');
  };

  const handleJoinGame = () => {
    if (isJoining) return;
    setIsJoining(true);
    const effectiveName = currentPlayer || playerName.trim();
    if (!effectiveName) {
      alert('Ange ditt namn först');
      setIsJoining(false);
      return;
    }
    if (!currentPlayer) {
      dispatch({ type: 'SET_PLAYER', payload: effectiveName });
    }
    const parsedData = SMSService.parseGameData(window.location.href);
    if (parsedData && parsedData.type === 'HITTA_GAME') {
      const joinPayload = { ...parsedData, isJoining: true, playerName: effectiveName };
      dispatch({ type: 'SET_PLAYER2', payload: effectiveName });
      dispatch({ type: 'START_GAME', payload: joinPayload });
      try {
        navigate('/game');
        // HashRouter fallback
        if (!window.location.hash.includes('/game')) {
          window.location.hash = '#/game';
        }
      } catch (e) {
        window.location.hash = '#/game';
      }
      setIsJoining(false);
    } else {
      alert('Inget aktivt spel att gå med i. Kontrollera att du har en giltig spellänk.');
      setIsJoining(false);
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

      {!hasGameLink ? (
        <div className="card">
          <h2>Spela</h2>
          <p>Starta ett nytt spel och dela med en kompis!</p>
          <button className="btn btn-primary btn-large" onClick={handleStartNewGame}>
            📸 Starta nytt spel
          </button>
        </div>
      ) : (
        <div className="card">
          <h2>Gå med i spel</h2>
          <p>Du har fått en spellänk! Ange ditt namn för att gå med i spelet.</p>
          
          <button className="btn btn-primary btn-large" onClick={handleJoinGame} disabled={isJoining}>
            {isJoining ? 'Ansluter…' : '🎮 Gå med i spel'}
          </button>
        </div>
      )}

      <div className="card">
        <h2>Så här spelar du:</h2>
        {!hasGameLink ? (
          <ol style={{ lineHeight: '1.6', color: '#666' }}>
            <li>Ta ett foto på ett objekt</li>
            <li>Objektet identifieras automatiskt</li>
            <li>Dela spelet via länk till en kompis</li>
            <li>Kompisen har 5 minuter att hitta samma typ av objekt</li>
            <li>Få poäng för varje objekt du hittar!</li>
          </ol>
        ) : (
          <ol style={{ lineHeight: '1.6', color: '#666' }}>
            <li>Ange ditt namn</li>
            <li>Klicka "Gå med i spel"</li>
            <li>Du har 5 minuter att hitta objektet</li>
            <li>Ta foto när du hittat det rätta objektet</li>
            <li>Få poäng om du hittar rätt!</li>
          </ol>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;