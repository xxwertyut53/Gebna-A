# Android APK Build Instructions

This directory contains the Android project for building the Gebna-A APK.

## Prerequisites

1. Install Android Studio from https://developer.android.com/studio
2. Install JDK 11 or later
3. Set up Android SDK (API 34 recommended)

## Building the APK

### Option 1: Using Android Studio (Recommended)

1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to the `android` folder in this repository
4. Wait for Gradle sync to complete
5. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
6. The APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

### Option 2: Using Command Line

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Features

- **WebView Wrapper**: Loads https://gebna-a.app
- **Custom User Agent**: Includes "GebnaA-Android/1.0" to detect APK users
- **Install Prompt Hidden**: The install prompt is automatically hidden in the APK
- **Logo**: Uses the same logo as the website
- **Auto-sync**: Any changes to the website are immediately reflected in the APK (since it loads the live website)

## Configuration

### Change Website URL

Edit `android/app/src/main/java/com/gebna/app/MainActivity.java`:
```java
webView.loadUrl("https://your-website-url.com");
```

### Change App Name

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

### Change App Icon

Replace the icon files in:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

And the round versions:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png`

## Auto-Translation Setup

The website includes auto-translation for product descriptions. To enable it:

1. Add the LibreTranslate URL to your `.env` file:
```
LIBRETRANSLATE_URL=https://libretranslate.com
```

2. Or use a self-hosted LibreTranslate instance for better performance.

When you add or edit a product and provide at least one description (in any language), the system will automatically translate it to the other two languages.

## Deployment

After building the APK:
1. Upload the APK to your server or app distribution platform
2. Share the download link with users
3. Users can install by downloading and enabling "Install from unknown sources" in their Android settings
