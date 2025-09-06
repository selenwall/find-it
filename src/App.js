import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';

import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import GameScreen from './screens/GameScreen';
import ScoreScreen from './screens/ScoreScreen';
import WaitingScreen from './screens/WaitingScreen';
import { GameProvider } from './context/GameContext';
import './App.css';

const App = () => {
  const [tfReady, setTfReady] = useState(false);

  useEffect(() => {
    const initializeTensorFlow = async () => {
      await tf.ready();
      setTfReady(true);
    };
    initializeTensorFlow();
  }, []);

  if (!tfReady) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Laddar TensorFlow...</p>
      </div>
    );
  }

  return (
    <GameProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/camera" element={<CameraScreen />} />
            <Route path="/game" element={<GameScreen />} />
            <Route path="/waiting" element={<WaitingScreen />} />
            <Route path="/score" element={<ScoreScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
};

export default App;