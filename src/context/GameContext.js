import React, { createContext, useContext, useReducer, useEffect } from 'react';
// Using localStorage instead of AsyncStorage for web

const GameContext = createContext();

const initialState = {
  currentPlayer: null,
  players: [],
  currentGame: null,
  gameHistory: [],
  score: 0,
  timeLeft: 300, // 5 minutes in seconds
  isGameActive: false,
  targetObject: null,
  foundObject: null,
  // Turn-based game states
  gameState: 'idle', // 'idle', 'waiting_for_opponent', 'playing', 'opponent_found'
  isMyTurn: true,
  opponentScore: 0,
  waitingForOpponent: false,
  // Both players info
  player1: { name: null, score: 0 },
  player2: { name: null, score: 0 },
  isPlayer1: true, // true if current user is player1
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
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
        player1: { ...state.player1, score: action.payload },
        score: state.isPlayer1 ? action.payload : state.score
      };
    case 'UPDATE_PLAYER2_SCORE':
      return { 
        ...state, 
        player2: { ...state.player2, score: action.payload },
        score: !state.isPlayer1 ? action.payload : state.score
      };
    case 'ADD_PLAYER':
      return { 
        ...state, 
        players: [...state.players, action.payload] 
      };
    case 'START_GAME':
      return {
        ...state,
        currentGame: action.payload,
        isGameActive: true,
        timeLeft: 300,
        targetObject: action.payload.targetObject,
        foundObject: null,
        gameState: 'playing',
        isMyTurn: !action.payload.isJoining, // Player1's turn when creating, Player2's turn when joining
        waitingForOpponent: false,
        // Set player info based on whether it's a new game or joining
        player1: action.payload.isJoining ? state.player1 : { name: action.payload.playerName, score: state.player1.score },
        player2: action.payload.isJoining ? { name: action.payload.playerName, score: state.player2.score } : state.player2,
        isPlayer1: !action.payload.isJoining,
      };
    case 'SHARE_GAME':
      return {
        ...state,
        gameState: 'waiting_for_opponent',
        waitingForOpponent: true,
        isMyTurn: false,
      };
    case 'OPPONENT_FOUND_OBJECT':
      return {
        ...state,
        gameState: 'opponent_found',
        waitingForOpponent: false,
        isMyTurn: true,
        opponentScore: state.opponentScore + 1,
      };
    case 'END_GAME':
      return {
        ...state,
        isGameActive: false,
        currentGame: null,
        targetObject: null,
        foundObject: null,
        gameState: 'idle',
        waitingForOpponent: false,
        isMyTurn: true,
      };
    case 'UPDATE_TIME':
      return { ...state, timeLeft: action.payload };
    case 'FOUND_OBJECT':
      const newScore = state.score + 1;
      return { 
        ...state, 
        foundObject: action.payload,
        score: newScore,
        isGameActive: false,
        gameState: 'idle',
        isMyTurn: true,
        waitingForOpponent: false,
        // Update the correct player's score
        player1: state.isPlayer1 ? { ...state.player1, score: newScore } : state.player1,
        player2: !state.isPlayer1 ? { ...state.player2, score: newScore } : state.player2,
      };
    case 'UPDATE_SCORE':
      return { ...state, score: action.payload };
    case 'RESET_GAME':
      return { ...initialState, players: state.players };
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved data on app start
  useEffect(() => {
    const loadGameData = () => {
      try {
        const savedData = localStorage.getItem('gameData');
        if (savedData) {
          const data = JSON.parse(savedData);
          dispatch({ type: 'SET_PLAYER', payload: data.currentPlayer });
          dispatch({ type: 'UPDATE_SCORE', payload: data.score });
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    };
    loadGameData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    const saveGameData = () => {
      try {
        localStorage.setItem('gameData', JSON.stringify({
          currentPlayer: state.currentPlayer,
          score: state.score,
        }));
      } catch (error) {
        console.error('Error saving game data:', error);
      }
    };
    saveGameData();
  }, [state.currentPlayer, state.score]);

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