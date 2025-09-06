import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SMSService from '../services/SMSService';

const ScoreScreen = () => {
  const { currentPlayer, score, players, dispatch } = useGame();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // In a real implementation, this would fetch leaderboard data
    // For demo purposes, we'll use mock data
    const mockLeaderboard = [
      { name: 'Anna', score: 15 },
      { name: 'Erik', score: 12 },
      { name: 'Maria', score: 8 },
      { name: currentPlayer || 'Du', score: score },
      { name: 'Lars', score: 5 },
    ].sort((a, b) => b.score - a.score);
    
    setLeaderboard(mockLeaderboard);
  }, [score, currentPlayer]);

  const shareScore = async () => {
    try {
      await SMSService.shareScore(currentPlayer, score, { objectClass: 'objekt' });
      alert('Din poäng har delats!');
    } catch (error) {
      console.error('Error sharing score:', error);
      alert('Kunde inte dela poängen');
    }
  };

  const resetScore = () => {
    const confirmed = window.confirm(
      'Är du säker på att du vill återställa din poäng?'
    );
    
    if (confirmed) {
      dispatch({ type: 'UPDATE_SCORE', payload: 0 });
      alert('Din poäng har återställts');
    }
  };

  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏆';
    }
  };

  return (
    <div className="score-screen">
      <div className="header">
        <h1>Poäng & Topplista</h1>
      </div>

      <div className="card">
        <h2>Din poäng</h2>
        <div className="score-display">{score}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={shareScore}>
            📤 Dela poäng
          </button>
          <button className="btn btn-danger" onClick={resetScore}>
            🔄 Återställ
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Topplista</h2>
        {leaderboard.map((player, index) => (
          <div
            key={player.name}
            className={`leaderboard-item ${player.name === currentPlayer ? 'current-player' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: player.name === currentPlayer ? '#E8F5E8' : 'transparent',
              borderRadius: player.name === currentPlayer ? '8px' : '0',
              margin: player.name === currentPlayer ? '2px 0' : '0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', width: '60px' }}>
              <span style={{ fontSize: '20px', marginRight: '5px' }}>{getRankEmoji(index)}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#666' }}>{index + 1}</span>
            </div>
            <span
              style={{
                flex: 1,
                fontSize: '16px',
                marginLeft: '10px',
                fontWeight: player.name === currentPlayer ? 'bold' : 'normal',
                color: player.name === currentPlayer ? '#4CAF50' : '#333'
              }}
            >
              {player.name}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>{player.score}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Framsteg</h2>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: '24px', marginRight: '15px' }}>🎯</span>
          <span style={{ fontSize: '16px', flex: 1 }}>
            {score >= 1 ? '✅' : '⏳'} Första objektet
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: '24px', marginRight: '15px' }}>🔥</span>
          <span style={{ fontSize: '16px', flex: 1 }}>
            {score >= 5 ? '✅' : '⏳'} 5 objekt hittade
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: '24px', marginRight: '15px' }}>💎</span>
          <span style={{ fontSize: '16px', flex: 1 }}>
            {score >= 10 ? '✅' : '⏳'} 10 objekt hittade
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: '24px', marginRight: '15px' }}>👑</span>
          <span style={{ fontSize: '16px', flex: 1 }}>
            {score >= 25 ? '✅' : '⏳'} 25 objekt hittade
          </span>
        </div>
      </div>

      <div className="card">
        <button
          className="btn btn-primary btn-large"
          onClick={() => navigate('/')}
        >
          🏠 Tillbaka till start
        </button>
      </div>
    </div>
  );
};

export default ScoreScreen;