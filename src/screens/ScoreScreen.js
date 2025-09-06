import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { useNavigation } from '@react-navigation/native';
import SMSService from '../services/SMSService';

const ScoreScreen = () => {
  const { currentPlayer, score, players, dispatch } = useGame();
  const navigation = useNavigation();
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
      Alert.alert('Delat!', 'Din poäng har delats via SMS');
    } catch (error) {
      console.error('Error sharing score:', error);
      Alert.alert('Fel', 'Kunde inte dela poängen');
    }
  };

  const resetScore = () => {
    Alert.alert(
      'Återställ poäng',
      'Är du säker på att du vill återställa din poäng?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Återställ',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'UPDATE_SCORE', payload: 0 });
            Alert.alert('Återställt', 'Din poäng har återställts');
          },
        },
      ]
    );
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Poäng & Topplista</Text>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Din poäng</Text>
        <Text style={styles.scoreValue}>{score}</Text>
        <View style={styles.scoreActions}>
          <TouchableOpacity style={styles.shareButton} onPress={shareScore}>
            <Text style={styles.shareButtonText}>📤 Dela poäng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetScore}>
            <Text style={styles.resetButtonText}>🔄 Återställ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.leaderboardCard}>
        <Text style={styles.leaderboardTitle}>Topplista</Text>
        {leaderboard.map((player, index) => (
          <View
            key={player.name}
            style={[
              styles.leaderboardItem,
              player.name === currentPlayer && styles.currentPlayerItem,
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={styles.rankEmoji}>{getRankEmoji(index)}</Text>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <Text
              style={[
                styles.playerName,
                player.name === currentPlayer && styles.currentPlayerName,
              ]}
            >
              {player.name}
            </Text>
            <Text style={styles.playerScore}>{player.score}</Text>
          </View>
        ))}
      </View>

      <View style={styles.achievementsCard}>
        <Text style={styles.achievementsTitle}>Framsteg</Text>
        <View style={styles.achievementItem}>
          <Text style={styles.achievementEmoji}>🎯</Text>
          <Text style={styles.achievementText}>
            {score >= 1 ? '✅' : '⏳'} Första objektet
          </Text>
        </View>
        <View style={styles.achievementItem}>
          <Text style={styles.achievementEmoji}>🔥</Text>
          <Text style={styles.achievementText}>
            {score >= 5 ? '✅' : '⏳'} 5 objekt hittade
          </Text>
        </View>
        <View style={styles.achievementItem}>
          <Text style={styles.achievementEmoji}>💎</Text>
          <Text style={styles.achievementText}>
            {score >= 10 ? '✅' : '⏳'} 10 objekt hittade
          </Text>
        </View>
        <View style={styles.achievementItem}>
          <Text style={styles.achievementEmoji}>👑</Text>
          <Text style={styles.achievementText}>
            {score >= 25 ? '✅' : '⏳'} 25 objekt hittade
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.primaryButtonText}>🏠 Tillbaka till start</Text>
        </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  scoreActions: {
    flexDirection: 'row',
    gap: 10,
  },
  shareButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentPlayerItem: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    marginVertical: 2,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  rankEmoji: {
    fontSize: 20,
    marginRight: 5,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  currentPlayerName: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  achievementsCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achievementEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementText: {
    fontSize: 16,
    flex: 1,
  },
  actions: {
    padding: 15,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ScoreScreen;