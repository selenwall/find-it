# Hitta! 🎯

Ett webbspel där spelare tar foton på objekt, delar dem via länk, och andra spelare måste hitta liknande objekt för att få poäng.

## Funktioner

- 📸 Ta foton med webbkameran
- 🤖 Automatisk objektigenkänning med TensorFlow.js och COCO SSD
- 🔗 Dela spel via länk (Web Share API + fallback)
- ⏰ 5-minuters tidsgräns per spel
- 🏆 Poängsystem och topplista
- 🎮 Enkelt och roligt att spela

## Live Demo

Spela spelet direkt: [https://yourusername.github.io/hitta-game](https://yourusername.github.io/hitta-game)

## Teknisk stack

- **React** - Webbapplikation
- **TensorFlow.js** - Objektigenkänning
- **COCO SSD** - Modell för objektigenkänning
- **Web Share API** - Delning av speldata
- **React Router** - Navigering mellan skärmar
- **GitHub Pages** - Hosting

## Lokal utveckling

1. Klona repot:
```bash
git clone https://github.com/yourusername/hitta-game.git
cd hitta-game
```

2. Installera dependencies:
```bash
npm install
```

3. Starta utvecklingsservern:
```bash
npm start
```

4. Öppna [http://localhost:3000](http://localhost:3000) i webbläsaren

## Deployment

Spelet deployas automatiskt till GitHub Pages när du pushar till `main`-branchen.

För manuell deployment:
```bash
npm run build
npm run deploy
```

## Behörigheter

Appen kräver följande behörigheter:
- Kamera - för att ta foton
- Clipboard - för att kopiera delningslänkar

## Hur man spelar

1. **Starta spelet**: Ange ditt namn och tryck på "Starta nytt spel"
2. **Ta foto**: Rikta kameran mot ett objekt och ta ett foto
3. **Dela**: Objektet identifieras automatiskt och du kan dela spelet via länk
4. **Hitta**: Din kompis får 5 minuter att hitta samma typ av objekt
5. **Få poäng**: Få 1 poäng för varje objekt du hittar!

## Projektstruktur

```
src/
├── screens/          # App-skärmar
│   ├── HomeScreen.js
│   ├── CameraScreen.js
│   ├── GameScreen.js
│   └── ScoreScreen.js
├── services/         # Tjänster
│   ├── ObjectDetection.js
│   └── SMSService.js
├── context/          # React Context
│   └── GameContext.js
├── App.js            # Huvudapplikation
├── App.css           # Stilar
└── index.js          # Entry point
```

## Utveckling

För att utveckla vidare på spelet:

1. Objektigenkänningen använder TensorFlow.js med COCO SSD-modellen
2. Delning fungerar med Web Share API och fallback till clipboard
3. Lägg till fler spelmoder och utmaningar
4. Implementera multiplayer-funktionalitet med backend
5. Lägg till fler achievement-badges

## Tekniska detaljer

- **Objektigenkänning**: Använder `@tensorflow/tfjs-models/coco-ssd` för att identifiera objekt i bilder
- **Kamera**: Använder `getUserMedia()` API för att komma åt kameran
- **Delning**: Web Share API med fallback till clipboard API
- **State Management**: React Context för global spelstate
- **Routing**: React Router för navigering mellan skärmar

## Licens

MIT License

## Bidrag

Bidrag är välkomna! Skapa en fork, gör dina ändringar och skicka en pull request.

## Support

Om du stöter på problem, skapa en issue på GitHub.