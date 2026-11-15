# ON TRACK // Android Trial & Packaging Guide

This guide details how to test the app on Android phones immediately and how to distribute it to testers for beta trials before public release.

---

## 🚀 Trial Method 1: Instant PWA Install (Zero Build Required)

The fastest and cleanest way to trial the app on Android devices right now.

### How it works:
1. **Host the app**:
   - Upload this folder to **GitHub Pages** (free), **Netlify** (free drag-and-drop), or run a quick local server.
2. **Open on any Android Phone**:
   - In **Google Chrome**, navigate to the URL.
3. **Install to Home Screen**:
   - Tap the red **`⬇ INSTALL`** button in the app header (or tap Chrome's `⋮` menu > **"Install app"** / **"Add to Home screen"**).
4. **Tester Experience**:
   - Installs directly to the Android app drawer and home screen.
   - Launches full-screen in standalone mode without any browser URL bar.
   - **100% Offline**: The Service Worker (`sw.js`) caches all exercises, animations, and audio, so testers can use it in airplane mode or gym basements.
   - Hardware integration: Voice cues, vibration pulses on countdown, and screen wake lock remain fully functional.

---

## 📱 Trial Method 2: Native Android APK (.apk) Direct Sideloading

For testers who prefer a native `.apk` file that installs directly on Android.

### Prerequisites (Once on your Mac):
1. **Node.js**: Download the macOS installer from [nodejs.org](https://nodejs.org/) or run `brew install node`.
2. **Android Studio**: Download from [developer.android.com/studio](https://developer.android.com/studio).

### Build in 1 Step:
Run the included build script in Terminal:
```bash
./build-android.sh
```
This automatically:
- Copies web assets to `www/`
- Installs `@capacitor/android`
- Syncs the Android project
- Compiles the debug APK to:
  `android/app/build/outputs/apk/debug/app-debug.apk`

### Sharing with Testers:
1. Upload `app-debug.apk` to Google Drive or send it via WhatsApp, Telegram, or email.
2. The tester downloads the file on their Android phone and taps **Install**.
3. (If prompted: tap *Allow from this source* in Android Settings).

---

## 🌐 Trial Method 3: Cloud Testing Platforms (Recommended for Scaling)

Before submitting to the public Google Play Store, use one of these dedicated testing platforms:

### 1. Google Play Console — Internal Testing (Official)
* **Tester capacity**: Up to 100 testers per track.
* **Review time**: Instant (no standard Google Play store review delay).
* **Setup**:
  1. Open [Google Play Console](https://play.google.com/console).
  2. Create an application named **ON TRACK**.
  3. Navigate to **Testing > Internal testing**.
  4. Create a new release and upload the signed `.aab` or `.apk`.
  5. Add your testers' Gmail addresses and share the private invite link.

### 2. Firebase App Distribution (Google Cloud)
* **Best for**: Rapid iterative builds and automatic update notifications.
* **Tester capacity**: Unlimited tester groups.
* **Features**:
  - Testers receive an email invite to install the **App Tester** helper.
  - Automatically alerts testers whenever you push a new build.

---

## 🛠️ Project Configuration Reference
* **Manifest**: [`manifest.webmanifest`](manifest.webmanifest)
* **Service Worker**: [`sw.js`](sw.js)
* **Capacitor Config**: [`capacitor.config.json`](capacitor.config.json)
* **Android Shell Script**: [`build-android.sh`](build-android.sh)
* **Icons**: [`icons/icon.svg`](icons/icon.svg), `icons/icon-192.png`, `icons/icon-512.png`
