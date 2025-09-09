import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

const initialState = {
  // Player info
  player1: { name: null, score: 0 },
  player2: { name: null, score: 0 },
  isPlayer1: true, // true if current user is player1
  
  // Game state
  gameState: 'idle', // 'idle', 'playing', 'waiting_for_share'
  isGameActive: false,
  targetObject: null,
  timeLeft: 120, // 2 minutes in seconds
  
  // Win condition
  winner: null, // null, 'player1', or 'player2'
  gameOver: false,
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER1':
      return { 
        ...state, 
        player1: { ...state.player1, name: action.payload },
        isPlayer1: true 
      };
    case 'SET_PLAYER2':
      return { 
        ...state, 
        player2: { ...state.player2, name: action.payload },
        isPlayer1: false 
      };
    case 'UPDATE_PLAYER1_SCORE':
      return { 
        ...state, 
        player1: { ...state.player1, score: action.payload }
      };
    case 'UPDATE_PLAYER2_SCORE':
      return { 
        ...state, 
        player2: { ...state.player2, score: action.payload }
      };
    case 'START_GAME':
      return {
        ...state,
        isGameActive: true,
        timeLeft: 120,
        targetObject: action.payload.targetObject,
        gameState: 'playing',
        // Set player info based on whether it's a new game or joining
        player1: action.payload.isJoining ? 
          { name: action.payload.player1Name || 'Spelare 1', score: state.player1.score } : 
          { name: action.payload.playerName, score: state.player1.score },
        player2: action.payload.isJoining ? 
          { name: action.payload.playerName, score: state.player2.score } : 
          { name: action.payload.player2Name || 'Spelare 2', score: state.player2.score },
        isPlayer1: !action.payload.isJoining,
      };
    case 'SHARE_OBJECT':
      return {
        ...state,
        gameState: 'waiting_for_share',
        targetObject: action.payload,
      };
    case 'UPDATE_TIME':
      return { ...state, timeLeft: action.payload };
    case 'FOUND_OBJECT':
      const currentScore = state.isPlayer1 ? state.player1.score : state.player2.score;
      const newScore = currentScore + 1;
      const updatedPlayer1 = state.isPlayer1 ? { ...state.player1, score: newScore } : state.player1;
      const updatedPlayer2 = !state.isPlayer1 ? { ...state.player2, score: newScore } : state.player2;
      
      // Check for winner (first to 5 points)
      const winner = newScore >= 5 ? (state.isPlayer1 ? 'player1' : 'player2') : null;
      const gameOver = winner !== null;
      
      return { 
        ...state, 
        isGameActive: !gameOver,
        gameState: gameOver ? 'game_over' : 'idle',
        player1: updatedPlayer1,
        player2: updatedPlayer2,
        winner: winner,
        gameOver: gameOver,
        targetObject: null,
      };
    case 'END_GAME':
      return {
        ...state,
        isGameActive: false,
        targetObject: null,
        gameState: 'idle',
        timeLeft: 120,
      };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Save game data when it changes
  useEffect(() => {
    const saveGameData = () => {
      try {
        localStorage.setItem('gameData', JSON.stringify({
          player1: state.player1,
          player2: state.player2,
        }));
      } catch (error) {
        console.error('Error saving game data:', error);
      }
    };
    saveGameData();
  }, [state.player1, state.player2]);

  // Load saved data on app start
  useEffect(() => {
    const loadGameData = () => {
      try {
        const savedData = localStorage.getItem('gameData');
        if (savedData) {
          const data = JSON.parse(savedData);
          if (data.player1?.name) {
            dispatch({ type: 'SET_PLAYER1', payload: data.player1.name });
            dispatch({ type: 'UPDATE_PLAYER1_SCORE', payload: data.player1.score || 0 });
          }
          if (data.player2?.name) {
            dispatch({ type: 'SET_PLAYER2', payload: data.player2.name });
            dispatch({ type: 'UPDATE_PLAYER2_SCORE', payload: data.player2.score || 0 });
          }
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    };
    loadGameData();
  }, []);

  const value = {
    ...state,
    dispatch,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};