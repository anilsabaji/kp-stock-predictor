# KP Stock Predictor - Android App

A mobile application for KP Astrology-based stock prediction on NSE India, built with React Native (Expo).

## Features

- **Stock Screener**: Browse 40+ NSE-listed companies with sector filters
- **KP Predictions**: Minute-level buy/sell signals using 5 KP levels (Mumbai transit)
- **Mumbai Transit**: Real-time planetary positions for NSE coordinates (19.056°N, 72.847°E)
- **Stock Detail**: Real-time price, company horoscope, and prediction summary
- **Market News**: Live news feed with sentiment analysis

## Building the APK

### Option 1: EAS Build (Recommended - Cloud Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build APK
eas build --platform android --profile preview
```

This builds the APK in Expo's cloud and gives you a download link.

### Option 2: Local Build

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build APK using Gradle
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### Option 3: Development Build (for testing)

```bash
# Start Expo dev server
npx expo start

# Scan QR code with Expo Go app on your Android phone
```

## Installing on Android

1. Build the APK using one of the methods above
2. Transfer the APK to your Android phone
3. Enable "Install from Unknown Sources" in Settings
4. Tap the APK file to install

## Project Structure

```
mobile/
├── App.js                    # Entry point
├── app.json                  # Expo/Android config
├── eas.json                  # EAS Build config
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js   # Tab + Stack navigation
│   ├── screens/
│   │   ├── StockListScreen.js      # NSE stock browser
│   │   ├── StockDetailScreen.js    # Individual stock analysis
│   │   ├── PredictionsScreen.js    # KP minute predictions
│   │   ├── MumbaiTransitScreen.js  # Mumbai planetary transit
│   │   └── NewsScreen.js           # Market news feed
│   ├── services/
│   │   └── api.js            # Yahoo Finance & Google News
│   └── utils/
│       ├── kpEngine.js       # Full KP calculation engine
│       └── theme.js          # Dark theme colors
└── assets/                   # App icons and splash
```

## Offline Capabilities

The KP Engine runs entirely on-device - no server needed for:
- Planetary position calculations
- Mumbai Ascendant computation
- KP 5-level analysis
- Company horoscope generation
- Prediction scoring

Internet is only needed for:
- Real-time stock prices (Yahoo Finance)
- News articles (Google News RSS)
