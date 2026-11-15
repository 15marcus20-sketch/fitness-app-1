#!/usr/bin/env bash
set -e

# ==============================================================================
# ON TRACK - Android Build & Packaging Helper
# ==============================================================================

echo "=================================================="
echo "  ON TRACK // Android Packaging & Build Automation"
echo "=================================================="

# 1. Check Node.js & npm
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo ""
  echo "❌ Node.js and npm are required to compile the native Android APK wrapper."
  echo "   To install on macOS:"
  echo "     - Download the macOS installer from https://nodejs.org/"
  echo "     - OR run: brew install node"
  echo ""
  echo "💡 NOTE: In the meantime, you can test the app immediately as a PWA!"
  echo "   Open index.html in Chrome on Android and tap 'Install' / 'Add to Home Screen'."
  exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo "✅ npm detected: $(npm -v)"

# 2. Prepare web release bundle in www/
echo ""
echo "📦 Packaging web distribution files into www/..."
mkdir -p www
cp -R index.html manifest.webmanifest sw.js css js icons www/
echo "✅ Assets copied to www/"

# 3. Check for dependencies
if [ ! -d "node_modules/@capacitor" ]; then
  echo ""
  echo "📥 Installing Capacitor dependencies..."
  npm install
fi

# 4. Check for android directory
if [ ! -d "android" ]; then
  echo ""
  echo "📱 Adding Android native platform..."
  npx cap add android
fi

# 5. Sync web assets into Android project
echo ""
echo "🔄 Syncing latest code and animations into Android WebView..."
npx cap sync android

# 6. Build debug APK if Android SDK/Gradle is available
if [ -d "android" ]; then
  echo ""
  echo "🔨 Checking Gradle environment..."
  cd android
  if [ -f "./gradlew" ]; then
    echo "⚙️  Building Debug APK (./gradlew assembleDebug)..."
    ./gradlew assembleDebug || {
      echo ""
      echo "⚠️  Gradle build halted (Android SDK or Java may need configuration)."
      echo "   To complete the build with a visual interface:"
      echo "     1. Open Android Studio"
      echo "     2. Select 'Open' and choose the 'android' folder in this directory"
      echo "     3. Click 'Build' -> 'Build Bundle(s) / APK(s)' -> 'Build APK(s)'"
      exit 0
    }
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
      echo ""
      echo "🎉 SUCCESS! Android APK generated at:"
      echo "   $(pwd)/$APK_PATH"
      echo ""
      echo "📲 Distribution instructions:"
      echo "   1. Copy app-debug.apk to Google Drive or send directly to testers via chat/email."
      echo "   2. Testers tap the APK on their Android phone to install and trial immediately."
    fi
  fi
fi
