import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { useNavigation } from '@react-navigation/native';
import SMSService from '../services/SMSService';

const HomeScreen = () => {
  const { currentPlayer, score, dispatch } = useGame();
  const navigation = useNavigation();
  const [playerName, setPlayerName] = useState(currentPlayer || '');
  const [friendName, setFriendName] = useState('');

  useEffect(() => {
    // Check for incoming game data from SMS
    const checkForIncomingGame = () => {
      // This would be implemented to check for deep links or incoming SMS data
      // For demo purposes, we'll skip this implementation
    };
    checkForIncomingGame();
  }, []);

  const handleSetPlayer = () => {
    if (playerName.trim()) {
      dispatch({ type: 'SET_PLAYER', payload: playerName.trim() });
      Alert.alert('Spelare satt', `Välkommen ${playerName}!`);
    } else {
      Alert.alert('Fel', 'Ange ett namn');
    }
  };

  const handleStartNewGame = () => {
    if (!currentPlayer) {
      Alert.alert('Fel', 'Ange ditt namn först');
      return;
    }
    navigation.navigate('Camera');
  };

  const handleJoinGame = () => {
    if (!currentPlayer) {
      Alert.alert('Fel', 'Ange ditt namn först');
      return;
    }
    // In a real implementation, this would handle joining a game from SMS
    Alert.alert('Info', 'Funktionen för att gå med i spel kommer snart!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Hitta!</Text>
        <Text style={styles.subtitle}>Ta foto, dela, hitta!</Text>
      </View>

      <View style={styles.playerSection}>
        <Text style={styles.sectionTitle}>Spelare</Text>
        <TextInput
          style={styles.input}
          placeholder="Ange ditt namn"
          value={playerName}
          onChangeText={setPlayerName}
          editable={!currentPlayer}
        />
        {!currentPlayer && (
          <TouchableOpacity style={styles.button} onPress={handleSetPlayer}>
            <Text style={styles.buttonText}>Sätt spelare</Text>
          </TouchableOpacity>
        )}
        {currentPlayer && (
          <Text style={styles.currentPlayer}>Spelare: {currentPlayer}</Text>
        )}
      </View>

      <View style={styles.scoreSection}>
        <Text style={styles.sectionTitle}>Din poäng</Text>
        <Text style={styles.score}>{score}</Text>
      </View>

      <View style={styles.gameSection}>
        <Text style={styles.sectionTitle}>Spela</Text>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartNewGame}>
          <Text style={styles.primaryButtonText}>📸 Starta nytt spel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinGame}>
          <Text style={styles.secondaryButtonText}>🎮 Gå med i spel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Så här spelar du:</Text>
        <Text style={styles.instructionText}>
          1. Ta ett foto på ett objekt{'\n'}
          2. Objektet identifieras automatiskt{'\n'}
          3. Dela spelet via SMS till en kompis{'\n'}
          4. Kompisen har 5 minuter att hitta samma typ av objekt{'\n'}
          5. Få poäng för varje objekt du hittar!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  playerSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPlayer: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  scoreSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  gameSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default HomeScreen;