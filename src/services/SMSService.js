// Web-based sharing service

class SMSService {
  async shareGame(targetObject, playerName, player1Name, player2Name) {
    try {
      const gameData = {
        obj: targetObject.objectClass,
        player1: player1Name,
        player2: player2Name
      };

      const encodedData = encodeURIComponent(JSON.stringify(gameData));
      // Ensure the URL uses hash routing so the app can read the query
      const base = `${window.location.origin}${window.location.pathname}`;
      const shareUrl = `${base}#/?game=${encodedData}`;
      
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
      // First, try standard search params
      let gameParam = urlObj.searchParams.get('game');
      // Fallback: parse from hash fragment (for HashRouter), e.g. #/?game=...
      if (!gameParam && urlObj.hash) {
        const hash = urlObj.hash.startsWith('#') ? urlObj.hash.slice(1) : urlObj.hash;
        const queryIndex = hash.indexOf('?');
        if (queryIndex !== -1) {
          const hashQuery = hash.slice(queryIndex + 1);
          const hashParams = new URLSearchParams(hashQuery);
          gameParam = hashParams.get('game');
        }
      }
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
            player1Name: gameData.player1 || 'Spelare 1',
            player2Name: gameData.player2 || 'Spelare 2',
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