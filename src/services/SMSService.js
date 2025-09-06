// Web-based sharing service

class SMSService {
  async shareGame(targetObject, playerName) {
    try {
      const gameData = {
        obj: targetObject.objectClass
      };

      const encodedData = encodeURIComponent(JSON.stringify(gameData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?game=${encodedData}`;
      
      const message = `🎯 Hitta! - ${playerName} utmanar dig!\n\nHitta en ${targetObject.objectClass}!\n\nDu har 5 minuter på dig!\n\nSpela här: ${shareUrl}`;

      // Try to use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Hitta! - Spelutmaning',
            text: message,
            url: shareUrl
          });
          return true;
        } catch (error) {
          console.log('Web Share API failed, falling back to clipboard');
        }
      }

      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(message);
        alert('Spellänk kopierad till urklipp! Dela den med din kompis via SMS eller meddelanden.');
        return true;
      } catch (error) {
        console.error('Clipboard API failed:', error);
        // Final fallback - show the URL
        const confirmed = window.confirm(
          `Kopiera denna länk och dela med din kompis:\n\n${shareUrl}\n\nKlicka OK för att kopiera.`
        );
        if (confirmed) {
          // Try to select the text
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Länk kopierad!');
        }
        return true;
      }
    } catch (error) {
      console.error('Error sharing game:', error);
      alert('Kunde inte dela spelet');
      return false;
    }
  }

  parseGameData(url) {
    try {
      const urlObj = new URL(url);
      const gameParam = urlObj.searchParams.get('game');
      if (gameParam) {
        const gameData = JSON.parse(decodeURIComponent(gameParam));
        if (gameData.obj) {
          // Convert back to the expected format
          return {
            type: 'HITTA_GAME',
            targetObject: {
              objectClass: gameData.obj,
              confidence: 0.9 // Default confidence
            },
            playerName: 'Unknown',
            timestamp: Date.now()
          };
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

      // Try to use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Hitta! - Poänguppdatering',
            text: message
          });
          return true;
        } catch (error) {
          console.log('Web Share API failed, falling back to clipboard');
        }
      }

      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(message);
        alert('Poänguppdatering kopierad till urklipp!');
        return true;
      } catch (error) {
        console.error('Clipboard API failed:', error);
        alert(message);
        return true;
      }
    } catch (error) {
      console.error('Error sharing score:', error);
      alert('Kunde inte dela poängen');
      return false;
    }
  }
}

export default new SMSService();