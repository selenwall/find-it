import { Linking, Alert } from 'react-native';

class SMSService {
  async shareGame(targetObject, playerName) {
    try {
      const gameData = {
        type: 'HITTA_GAME',
        targetObject: targetObject,
        playerName: playerName,
        timestamp: Date.now(),
      };

      const encodedData = encodeURIComponent(JSON.stringify(gameData));
      const message = `🎯 Hitta! - ${playerName} utmanar dig!\n\nHitta en ${targetObject.objectClass}!\n\nDu har 5 minuter på dig!\n\nSpela här: hitta://game?data=${encodedData}`;

      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        return true;
      } else {
        Alert.alert('Fel', 'Kunde inte öppna SMS-appen');
        return false;
      }
    } catch (error) {
      console.error('Error sharing game via SMS:', error);
      Alert.alert('Fel', 'Kunde inte dela spelet via SMS');
      return false;
    }
  }

  parseGameData(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'hitta:' && urlObj.pathname === '//game') {
        const dataParam = urlObj.searchParams.get('data');
        if (dataParam) {
          const gameData = JSON.parse(decodeURIComponent(dataParam));
          if (gameData.type === 'HITTA_GAME') {
            return gameData;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing game data:', error);
      return null;
    }
  }

  async shareScore(playerName, score, foundObject) {
    try {
      const message = `🎉 ${playerName} hittade en ${foundObject.objectClass}!\n\nPoäng: ${score}\n\nBra jobbat! 🏆`;

      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        return true;
      } else {
        Alert.alert('Fel', 'Kunde inte öppna SMS-appen');
        return false;
      }
    } catch (error) {
      console.error('Error sharing score via SMS:', error);
      Alert.alert('Fel', 'Kunde inte dela poängen via SMS');
      return false;
    }
  }
}

export default new SMSService();