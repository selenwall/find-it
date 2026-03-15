import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

const initialState = {
  // Spelarinformation
  player1: { name: '', score: 0 },
  player2: { name: '', score: 0 },
  currentPlayerName: '',
  isPlayer1: true,
  
  // Spelstatus
  gameActive: false,
  isMyTurn: false,
  targetObject: null,
  timeLeft: 120,
  winner: null,
  
  // Kamerastatus
  cameraActive: false,
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER_NAME':
      return { 
        ...state, 
        currentPlayerName: action.payload 
      };
      
    case 'START_NEW_GAME':
      return {
        ...state,
        player1: { name: state.currentPlayerName, score: 0 },
        player2: { name: '', score: 0 },
        isPlayer1: true,
        gameActive: true,
        isMyTurn: true,
        targetObject: null,
        winner: null,
      };
      
    case 'JOIN_GAME':
      return {
        ...state,
        player1: { name: action.payload.player1Name, score: action.payload.player1Score || 0 },
        player2: { name: state.currentPlayerName, score: action.payload.player2Score || 0 },
        isPlayer1: false,
        gameActive: true,
        isMyTurn: true,
        targetObject: action.payload.targetObject,
        timeLeft: 120,
        winner: null,
      };
      
    case 'SET_TARGET_OBJECT':
      return {
        ...state,
        targetObject: action.payload,
        isMyTurn: false,
      };
      
    case 'OBJECT_FOUND':
      const currentPlayer = state.isPlayer1 ? 'player1' : 'player2';
      const newScore = state[currentPlayer].score + 1;
      const updatedState = {
        ...state,
        [currentPlayer]: { ...state[currentPlayer], score: newScore },
        isMyTurn: true,
        targetObject: null,
        timeLeft: 120,
      };
      
      // Kolla om någon vunnit (först till 5)
      if (newScore >= 5) {
        updatedState.winner = currentPlayer;
        updatedState.gameActive = false;
      }
      
      return updatedState;
      
    case 'TIME_OUT':
      return {
        ...state,
        isMyTurn: true,
        targetObject: null,
        timeLeft: 120,
      };
      
    case 'UPDATE_TIME':
      return {
        ...state,
        timeLeft: action.payload,
      };
      
    case 'SET_CAMERA_ACTIVE':
      return {
        ...state,
        cameraActive: action.payload,
      };
      
    case 'RESET_GAME':
      return {
        ...initialState,
        currentPlayerName: state.currentPlayerName,
      };
      
    case 'UPDATE_SCORES':
      return {
        ...state,
        player1: { ...state.player1, score: action.payload.player1Score },
        player2: { ...state.player2, score: action.payload.player2Score },
      };
      
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Spara spelarnamn i localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      dispatch({ type: 'SET_PLAYER_NAME', payload: savedName });
    }
  }, []);

  useEffect(() => {
    if (state.currentPlayerName) {
      localStorage.setItem('playerName', state.currentPlayerName);
    }
  }, [state.currentPlayerName]);

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