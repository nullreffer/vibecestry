# Vibecestry Android App

This directory contains the Android app configuration for the Vibecestry family tree application.

## Prerequisites

1. **Android Studio** - Install the latest version
2. **Android SDK** - API level 21 or higher
3. **Java Development Kit (JDK)** - Version 11 or higher
4. **Node.js** - Version 16 or higher
5. **React Native CLI** - `npm install -g react-native-cli`

## Setup Instructions

### 1. Install Dependencies

From the root directory of the project:

```bash
# Install all project dependencies
npm run install-all

# Install React Native dependencies
npm install
```

### 2. Android Development Environment

1. Install Android Studio from https://developer.android.com/studio
2. Open Android Studio and install the Android SDK
3. Add the Android SDK to your PATH:
   - Add `ANDROID_HOME` environment variable pointing to your SDK location
   - Add `ANDROID_HOME/platform-tools` to your PATH

### 3. Running the Android App

#### Development Mode

```bash
# Start the Metro bundler
npx react-native start

# In a new terminal, run the Android app
npm run android
```

#### Building APK

```bash
# Build debug APK
npm run android:build

# Build release APK (requires signing configuration)
npm run android:release
```

## Project Structure

```
android/
├── app/
│   ├── build.gradle           # App-level build configuration
│   └── src/main/
│       ├── AndroidManifest.xml # App permissions and configuration
│       ├── java/com/vibecestry/ # Java/Kotlin source code
│       │   ├── MainActivity.java
│       │   └── MainApplication.java
│       └── res/               # Android resources
│           ├── values/
│           │   ├── strings.xml
│           │   └── styles.xml
│           └── mipmap/        # App icons (add your icons here)
├── build.gradle              # Project-level build configuration
├── gradle.properties         # Gradle properties
└── settings.gradle           # Gradle settings
```

## Configuration Files

- **`index.js`** - Entry point that registers the React Native app
- **`metro.config.js`** - Metro bundler configuration
- **`babel.config.js`** - Babel transpilation configuration

## Customization

### App Icon
1. Place your app icons in `android/app/src/main/res/mipmap/`
2. Update the icon references in `AndroidManifest.xml`

### App Name
1. Update the app name in `android/app/src/main/res/values/strings.xml`
2. Update the package name in `android/app/build.gradle` and Java files

### Permissions
Add required permissions to `android/app/src/main/AndroidManifest.xml`

## Troubleshooting

### Common Issues

1. **Metro bundler errors**: Run `npx react-native start --reset-cache`
2. **Build errors**: Run `npm run android:clean` then rebuild
3. **SDK not found**: Ensure `ANDROID_HOME` is set correctly

### Build Configuration

The app is configured with:
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Build Tools: 34.0.0
- Hermes JS engine enabled for better performance

## Development Workflow

1. **Frontend Development**: Continue developing React components in `frontend/src/`
2. **Backend API**: The app will connect to your backend running on `localhost:3001`
3. **Testing**: Use Android emulator or physical device for testing
4. **Building**: Use the provided scripts for building APK files

## Notes

- The Android app uses the same React components from the `frontend/src/` directory
- API calls will need to be updated to use the actual backend URL in production
- Consider implementing proper error handling for network requests
- Add proper app icons and splash screens for production release
