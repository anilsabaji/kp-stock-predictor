#!/bin/bash
# ============================================================
# KP Stock Predictor - Android APK Build Script
# ============================================================
# This script builds an installable APK for Android.
# 
# PREREQUISITES:
# 1. Node.js 18+ installed
# 2. Java 17+ installed (JDK)
# 3. Android Studio installed (for SDK) OR ANDROID_HOME set
#
# METHODS:
# Method 1: EAS Build (easiest - builds in cloud)
# Method 2: Local Expo build (requires Android SDK)
# Method 3: PWA to APK using Bubblewrap/TWA
# ============================================================

echo "================================================"
echo "  KP Stock Predictor - Android APK Builder"
echo "================================================"
echo ""

# Check for required tools
check_tool() {
    if command -v "$1" &> /dev/null; then
        echo "✓ $1 found"
        return 0
    else
        echo "✗ $1 not found"
        return 1
    fi
}

echo "Checking prerequisites..."
check_tool node
check_tool npm
check_tool java

echo ""
echo "Select build method:"
echo "  1) EAS Cloud Build (requires Expo account - easiest)"
echo "  2) Local Expo Build (requires Android SDK)"
echo "  3) PWA APK via Bubblewrap (requires JDK + Android SDK)"
echo ""
read -p "Enter choice (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "=== EAS Cloud Build ==="
        echo "Installing eas-cli..."
        npm install -g eas-cli
        
        echo "Login to Expo (create free account at expo.dev)..."
        eas login
        
        echo "Building APK (this uploads to Expo servers)..."
        eas build --platform android --profile preview
        
        echo ""
        echo "✓ Build submitted! Check your Expo dashboard for the download link."
        echo "  The APK will be available at: https://expo.dev/accounts/YOUR_USERNAME/projects/kp-stock-predictor/builds"
        ;;
    2)
        echo ""
        echo "=== Local Expo Build ==="
        
        if [ -z "$ANDROID_HOME" ]; then
            echo "ERROR: ANDROID_HOME not set. Install Android Studio first."
            echo "Set: export ANDROID_HOME=~/Android/Sdk"
            exit 1
        fi
        
        echo "Generating native Android project..."
        npx expo prebuild --platform android --clean
        
        echo "Building release APK..."
        cd android && ./gradlew assembleRelease
        
        APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
        if [ -f "$APK_PATH" ]; then
            echo ""
            echo "✓ APK built successfully!"
            echo "  Location: $APK_PATH"
            echo "  Size: $(du -h $APK_PATH | cut -f1)"
            echo ""
            echo "Transfer to your phone and install!"
        else
            echo "✗ Build failed. Check the error output above."
        fi
        ;;
    3)
        echo ""
        echo "=== PWA to APK (Bubblewrap/TWA) ==="
        echo "This wraps your web app as a native Android app."
        echo ""
        echo "First, deploy the web app to a public URL, then:"
        echo ""
        echo "  npm install -g @nicolo-ribaudo/bubblewrap"
        echo "  bubblewrap init --manifest https://YOUR_DEPLOYED_URL/manifest.json"
        echo "  bubblewrap build"
        echo ""
        echo "The APK will be generated in the current directory."
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
