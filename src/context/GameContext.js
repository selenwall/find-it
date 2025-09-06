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
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
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
      };
    case 'END_GAME':
      return {
        ...state,
        isGameActive: false,
        currentGame: null,
        targetObject: null,
        foundObject: null,
      };
    case 'UPDATE_TIME':
      return { ...state, timeLeft: action.payload };
    case 'FOUND_OBJECT':
      return { 
        ...state, 
        foundObject: action.payload,
        score: state.score + 1,
        isGameActive: false,
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