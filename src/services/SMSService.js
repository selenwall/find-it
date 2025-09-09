class SMSService {
  async shareChallenge(targetObject, player1Name, player1Score, player2Score) {
    try {
      const gameData = {
        obj: targetObject.objectClass,
        p1: player1Name,
        p1s: player1Score,
        p2s: player2Score || 0,
        t: Date.now()
      };

      const encodedData = encodeURIComponent(JSON.stringify(gameData));
      const base = `${window.location.origin}${window.location.pathname}`;
      const shareUrl = `${base}#/?game=${encodedData}`;
      
      const scoreText = `${player1Name}: ${player1Score} poäng\nMotspelare: ${player2Score || 0} poäng\n\n`;
      const message = `🎯 Hitta-utmaning!\n\n${scoreText}Hitta en "${targetObject.objectClass}"!\nDu har 2 minuter på dig.\n\n${shareUrl}`;

      // Försök använda Web Share API först
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Hitta! - Spelutmaning',
            text: message
          });
          return true;
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.log('Web Share API failed, falling back');
          }
        }
      }

      // Fallback till clipboard
      try {
        await navigator.clipboard.writeText(message);
        alert('Utmaning kopierad! Klistra in i SMS, WhatsApp eller annan meddelandeapp.');
        return true;
      } catch (error) {
        // Sista fallback
        const textArea = document.createElement('textarea');
        textArea.value = message;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Utmaning kopierad!');
        return true;
      }
    } catch (error) {
      console.error('Error sharing challenge:', error);
      alert('Kunde inte dela utmaningen');
      return false;
    }
  }

  async shareFoundObject(playerName, player1Score, player2Score, foundObject) {
    try {
      const message = `🎉 ${playerName} hittade "${foundObject.objectClass}"!\n\nPoängställning:\nSpelare 1: ${player1Score} poäng\nSpelare 2: ${player2Score} poäng\n\n${player1Score >= 5 || player2Score >= 5 ? '🏆 Spelet är slut!' : 'Nu är det din tur att fotografera något!'}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Hitta! - Poäng',
            text: message
          });
          return true;
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.log('Web Share API failed, falling back');
          }
        }
      }

      try {
        await navigator.clipboard.writeText(message);
        alert('Meddelande kopierat!');
        return true;
      } catch (error) {
        alert(message);
        return true;
      }
    } catch (error) {
      console.error('Error sharing score:', error);
      return false;
    }
  }

  parseGameData(url) {
    try {
      const urlObj = new URL(url);
      let gameParam = urlObj.searchParams.get('game');
      
      // Kolla i hash för HashRouter
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
        return {
          targetObject: {
            objectClass: gameData.obj,
            confidence: 0.9
          },
          player1Name: gameData.p1,
          player1Score: gameData.p1s || 0,
          player2Score: gameData.p2s || 0,
          timestamp: gameData.t
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing game data:', error);
      return null;
    }
  }

  async shareWinner(winnerName, player1Score, player2Score) {
    try {
      const message = `🏆 ${winnerName} vann Hitta!\n\nSlutresultat:\nSpelare 1: ${player1Score} poäng\nSpelare 2: ${player2Score} poäng\n\nGrattis! 🎉`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Hitta! - Vinnare',
            text: message
          });
          return true;
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.log('Web Share API failed');
          }
        }
      }

      try {
        await navigator.clipboard.writeText(message);
        alert('Vinnarmeddelande kopierat!');
        return true;
      } catch (error) {
        alert(message);
        return true;
      }
    } catch (error) {
      console.error('Error sharing winner:', error);
      return false;
    }
  }
}

export default new SMSService();