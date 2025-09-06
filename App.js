import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-platform-react-native';

import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import GameScreen from './src/screens/GameScreen';
import ScoreScreen from './src/screens/ScoreScreen';
import { GameProvider } from './src/context/GameContext';

const Stack = createStackNavigator();

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
    return null; // Loading screen could be added here
  }

  return (
    <GameProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Hitta! 🎯' }}
          />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen} 
            options={{ title: 'Ta foto' }}
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen} 
            options={{ title: 'Hitta objektet!' }}
          />
          <Stack.Screen 
            name="Score" 
            component={ScoreScreen} 
            options={{ title: 'Poäng' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GameProvider>
  );
};

export default App;