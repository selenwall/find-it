# Hitta! 🎯

Ett mobilspel där spelare tar foton på objekt, delar dem via SMS, och andra spelare måste hitta liknande objekt för att få poäng.

## Funktioner

- 📸 Ta foton med mobilkameran
- 🤖 Automatisk objektigenkänning med TensorFlow Lite och COCO SSD
- 📱 Dela spel via SMS
- ⏰ 5-minuters tidsgräns per spel
- 🏆 Poängsystem och topplista
- 🎮 Enkelt och roligt att spela

## Teknisk stack

- **React Native** - Mobilapplikation
- **TensorFlow Lite** - Objektigenkänning
- **COCO SSD** - Modell för objektigenkänning
- **AsyncStorage** - Lokal datalagring
- **React Navigation** - Navigering mellan skärmar
- **SMS API** - Delning av speldata

## Installation

1. Installera dependencies:
```bash
npm install
```

2. För iOS:
```bash
cd ios && pod install && cd ..
npm run ios
```

3. För Android:
```bash
npm run android
```

## Behörigheter

Appen kräver följande behörigheter:
- Kamera - för att ta foton
- SMS - för att dela speldata
- Lagring - för att spara bilder

## Hur man spelar

1. **Starta spelet**: Ange ditt namn och tryck på "Starta nytt spel"
2. **Ta foto**: Rikta kameran mot ett objekt och ta ett foto
3. **Dela**: Objektet identifieras automatiskt och du kan dela spelet via SMS
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
└── context/          # React Context
    └── GameContext.js
```

## Utveckling

För att utveckla vidare på spelet:

1. Objektigenkänningen använder för närvarande mockdata - implementera riktig TensorFlow Lite-integration
2. SMS-delning kan förbättras med deep linking
3. Lägg till fler spelmoder och utmaningar
4. Implementera multiplayer-funktionalitet med backend

## Licens

MIT License