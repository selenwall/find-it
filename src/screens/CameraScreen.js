import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useGame } from '../context/GameContext';
import { useNavigation } from '@react-navigation/native';
import ObjectDetectionService from '../services/ObjectDetection';
import SMSService from '../services/SMSService';

const CameraScreen = () => {
  const { currentPlayer, dispatch } = useGame();
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedObject, setDetectedObject] = useState(null);

  useEffect(() => {
    // Initialize object detection service
    ObjectDetectionService.loadModel();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
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
        setDetectedObject(detection);
        
        Alert.alert(
          'Objekt identifierat!',
          `Jag hittade en ${detection.objectClass} (${Math.round(detection.confidence * 100)}% säker)`,
          [
            {
              text: 'Ta nytt foto',
              onPress: () => setDetectedObject(null),
            },
            {
              text: 'Dela spelet',
              onPress: () => shareGame(detection),
            },
          ]
        );
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Fel', 'Kunde inte ta foto');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const shareGame = async (object) => {
    try {
      const success = await SMSService.shareGame(object, currentPlayer);
      if (success) {
        // Start the game for the current player
        dispatch({
          type: 'START_GAME',
          payload: {
            targetObject: object,
            playerName: currentPlayer,
            timestamp: Date.now(),
          },
        });
        navigation.navigate('Game');
      }
    } catch (error) {
      console.error('Error sharing game:', error);
      Alert.alert('Fel', 'Kunde inte dela spelet');
    }
  };

  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.processingText}>Analyserar foto...</Text>
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
        androidCameraPermissionOptions={{
          title: 'Kamerabehörighet',
          message: 'Appen behöver tillgång till kameran för att ta foton',
          buttonPositive: 'OK',
          buttonNegative: 'Avbryt',
        }}
        androidRecordAudioPermissionOptions={{
          title: 'Mikrofonbehörighet',
          message: 'Appen behöver tillgång till mikrofonen för videoinspelning',
          buttonPositive: 'OK',
          buttonNegative: 'Avbryt',
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.instructionText}>
            Rikta kameran mot ett objekt
          </Text>
        </View>
        
        <View style={styles.bottomOverlay}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>

      {detectedObject && (
        <View style={styles.detectionOverlay}>
          <Text style={styles.detectionText}>
            Objekt: {detectedObject.objectClass}
          </Text>
          <Text style={styles.confidenceText}>
            Säkerhet: {Math.round(detectedObject.confidence * 100)}%
          </Text>
        </View>
      )}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    paddingTop: 50,
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 30,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  detectionOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  detectionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
});

export default CameraScreen;