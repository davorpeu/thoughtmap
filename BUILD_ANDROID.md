# Building the ThoughtMap Android APK

The app is a Vue 3 + Vite PWA wrapped with Capacitor. The APK bundles all web
assets inside it, so the installed app is fully offline and stores data locally
on the device (IndexedDB). No server or internet is needed at runtime.

## Toolchain (already installed on this PC)

- **Node.js** (for the Vue/Vite build)
- **JDK 21** — `C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot`
  (Capacitor 7's Android library requires Java 21; JDK 17 fails with
  "invalid source release: 21".)
- **Android SDK** — `C:\Android\sdk` (command-line tools + platform-tools,
  platforms;android-36, build-tools;36.0.0). Licenses pre-accepted in
  `C:\Android\sdk\licenses`.
- `android/local.properties` points Gradle at the SDK (`sdk.dir=C:\\Android\\sdk`).

## Rebuild the APK after changing the app

```powershell
# 1. Build the web app and copy it into the native project
npm run build
npx cap sync android

# 2. Build the debug APK (uses JDK 21 + the Android SDK)
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:ANDROID_SDK_ROOT = "C:\Android\sdk"
Set-Location android
.\gradlew.bat assembleDebug --no-daemon
Set-Location ..
```

Output APK: `android\app\build\outputs\apk\debug\app-debug.apk`
(A copy is placed at the project root as `ThoughtMap.apk`.)

## Install on an Android phone

1. Copy `ThoughtMap.apk` to the phone (USB cable, Bluetooth, or a local file
   transfer — no internet required).
2. On the phone, tap the APK. Android will ask to allow installing from this
   source — allow it, then Install.
3. Open ThoughtMap, choose a language, and start adding entries.

This is a **debug** APK (self-signed). It installs fine by sideloading. For a
Play Store release you'd build a signed release AAB instead.

## iPhone (later)

The same Capacitor project can target iOS via `npx cap add ios`, but building
and installing an iOS app requires a Mac with Xcode + an Apple ID (a free Apple
ID allows 7-day sideloading; a paid Apple Developer account is needed for
TestFlight / App Store). Alternatively, install the PWA on iPhone via Safari's
"Add to Home Screen" (needs the app served over HTTPS once).
