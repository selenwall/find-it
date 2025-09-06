import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useGame } from '../context/GameContext';
import { useNavigation } from '@react-navigation/native';
import ObjectDetectionService from '../services/ObjectDetection';
import SMSService from '../services/SMSService';

const GameScreen = () => {
  const { 
    currentGame, 
    targetObject, 
    timeLeft, 
    isGameActive, 
    score, 
    dispatch 
  } = useGame();
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isGameActive && !gameStarted) {
      startGame();
    }
  }, [isGameActive]);

  useEffect(() => {
    if (timeLeft <= 0 && isGameActive) {
      endGame(false);
    }
  }, [timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    startTimer();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      dispatch({ type: 'UPDATE_TIME', payload: timeLeft - 1 });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const endGame = (found) => {
    stopTimer();
    dispatch({ type: 'END_GAME' });
    
    if (found) {
      dispatch({ type: 'FOUND_OBJECT', payload: targetObject });
      Alert.alert(
        'Grattis! 🎉',
        `Du hittade en ${targetObject.objectClass}! Du får 1 poäng!`,
        [
          {
            text: 'Dela poäng',
            onPress: () => shareScore(),
          },
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } else {
      Alert.alert(
        'Tiden är ute! ⏰',
        `Du hittade inte en ${targetObject.objectClass} i tid. Bättre lycka nästa gång!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    }
  };

  const shareScore = async () => {
    try {
      await SMSService.shareScore(currentGame.playerName, score + 1, targetObject);
    } catch (error) {
      console.error('Error sharing score:', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing && isGameActive) {
      try {
        setIsProcessing(true);
        const options = {
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        };
        
        const data = await cameraRef.current.takePictureAsync(options);
        console.log('Picture taken:', data.uri);
        
        // Detect objects in the image
        const detection = await ObjectDetectionService.detectObjects(data.uri);
        
        // Check if the detected object matches the target
        const isMatch = await ObjectDetectionService.matchObjects(targetObject, detection);
        
        if (isMatch) {
          Alert.alert(
            'Match! 🎯',
            `Du hittade en ${detection.objectClass}! Det matchar målet!`,
            [
              {
                text: 'Fantastiskt!',
                onPress: () => endGame(true),
              },
            ]
          );
        } else {
          Alert.alert(
            'Inte rätt objekt',
            `Du hittade en ${detection.objectClass}, men du letar efter en ${targetObject.objectClass}.`,
            [
              {
                text: 'Fortsätt leta',
                onPress: () => setIsProcessing(false),
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Fel', 'Kunde inte ta foto');
        setIsProcessing(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isGameActive) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Inget aktivt spel</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Tillbaka till start</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.auto}
      />
      
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          <Text style={styles.targetText}>
            Hitta en: {targetObject.objectClass}
          </Text>
        </View>
        
        <View style={styles.bottomOverlay}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              (!isGameActive || isProcessing) && styles.captureButtonDisabled
            ]}
            onPress={takePicture}
            disabled={!isGameActive || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoOverlay}>
        <Text style={styles.infoText}>
          {isProcessing ? 'Analyserar foto...' : 'Ta foto när du hittat objektet!'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    paddingTop: 50,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  timerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  targetText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 30,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonDisabled: {
    backgroundColor: '#ccc',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameScreen;