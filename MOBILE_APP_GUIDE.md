# Noble Elegance Mobile App - Capacitor Integration Guide

## Overview
This document provides complete instructions for building and deploying the Noble Elegance mobile applications for iOS and Android.

## ✅ Completed Setup

### 1. Capacitor Installation & Configuration
- ✅ Installed @capacitor/core and @capacitor/cli
- ✅ Initialized Capacitor with:
  - **App Name:** Noble Elegance
  - **App ID:** uk.co.nobleelegance
  - **Web Directory:** dist/
- ✅ Installed platform packages (@capacitor/android, @capacitor/ios)
- ✅ Added Android and iOS platforms

### 2. Native Plugins Installed
- ✅ @capacitor/app - App lifecycle and back button handling
- ✅ @capacitor/device - Device information
- ✅ @capacitor/haptics - Haptic feedback for native feel
- ✅ @capacitor/share - Native share functionality
- ✅ @capacitor/splash-screen - Splash screen management
- ✅ @capacitor/status-bar - Status bar customization

### 3. Mobile Optimizations
- ✅ Enhanced viewport meta tag with `viewport-fit=cover` for notch support
- ✅ Created Capacitor initialization module (src/capacitor/appInit.js)
- ✅ Integrated mobile init into main.jsx
- ✅ Configured:
  - Status bar styling (brand gold color)
  - Safe area insets for iOS notch
  - Pull-to-refresh prevention
  - Android back button handling
  - Splash screen auto-hide

### 4. Configuration Files
- ✅ capacitor.config.json with HTTPS scheme and splash screen settings
- ✅ Mobile-optimized viewport settings in index.html

---

## 📱 Building the Mobile Apps

### Prerequisites

#### For Android:
- **Android Studio** (download from https://developer.android.com/studio)
- **Java Development Kit (JDK)** 17 or higher
- **Android SDK** (included with Android Studio)

#### For iOS (macOS only):
- **Xcode** 15+ (download from App Store)
- **CocoaPods** (install: `sudo gem install cocoapods`)
- **Apple Developer Account** (for App Store deployment)

---

## 🔨 Build Process

### Step 1: Build the Web Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Step 2: Sync to Native Projects

After every web app update, sync changes:

```bash
npx cap sync
```

This copies the web assets to both iOS and Android projects and updates native dependencies.

---

## 🤖 Android Development

### Open Android Project

```bash
npx cap open android
```

This opens the project in Android Studio.

### Android Studio Setup

1. **First Time Setup:**
   - Let Android Studio download any required SDK components
   - Wait for Gradle sync to complete
   - Accept any license agreements

2. **Configure App:**
   - File → Project Structure → Project
   - Set Gradle Version to latest stable
   - Set JDK to version 17+

### Build Android App

1. **Debug Build (for testing):**
   - Click "Run" button (green play icon)
   - Select connected device or emulator
   - App will install and launch

2. **Release Build (for Play Store):**
   ```bash
   # In Android Studio: Build → Generate Signed Bundle / APK
   # Choose "Android App Bundle"
   # Create or select signing key
   ```

### Android Configuration Files

**`android/app/build.gradle`** - Update version:
```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
}
```

**`android/app/src/main/AndroidManifest.xml`** - Already configured with:
- Internet permission
- Camera permission (for future use)
- Network state permission

---

## 🍎 iOS Development

### Open iOS Project

```bash
npx cap open ios
```

This opens the project in Xcode.

### Xcode Setup

1. **First Time Setup:**
   - Select the "App" target
   - General tab → Team: Select your Apple Developer account
   - Signing & Capabilities → Enable "Automatically manage signing"

2. **Configure App:**
   - Display Name: "Noble Elegance"
   - Bundle Identifier: uk.co.nobleelegance
   - Version: 1.0.0
   - Build: 1

### Build iOS App

1. **Simulator Build (for testing):**
   - Select target device (e.g., iPhone 15)
   - Click Play button
   - App builds and launches in simulator

2. **Physical Device Testing:**
   - Connect iPhone/iPad via USB
   - Select device from dropdown
   - Trust computer on device if prompted
   - Click Play to build and run

3. **App Store Build:**
   ```bash
   # In Xcode: Product → Archive
   # Once archived: Window → Organizer
   # Distribute App → App Store Connect
   ```

### iOS Configuration Files

**`ios/App/App/Info.plist`** - Key configurations:
- Camera usage description (for future profile images)
- Photo library usage description
- Location when in use description (if needed)

---

## 🎨 App Icons & Splash Screens

### Required Assets

Create these files in the `resources/` folder:

1. **icon.png** - 1024x1024px
   - Square logo with transparent or colored background
   - Should look good when rounded (iOS) or with adaptive icon (Android)
   - Use your existing logo from `src/assets/logo.svg`

2. **splash.png** - 2732x2732px
   - Centered logo on white (#ffffff) background
   - Logo should be ~1200px wide in center

### Generate Icons & Splash Screens

```bash
# Create resources folder
mkdir resources

# Copy and prepare your icon
# Then generate all sizes:
npx capacitor-assets generate
```

This automatically creates:
- iOS app icons (all sizes)
- Android app icons (all densities, adaptive icons)
- iOS launch screens
- Android splash screens

---

## 🔧 Configuration Details

### capacitor.config.json

```json
{
  "appId": "uk.co.nobleelegance",
  "appName": "Noble Elegance",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https",
    "iosScheme": "https",
    "hostname": "app.nobleelegance.co.uk"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#ffffff",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": false,
      "splashFullScreen": true,
      "splashImmersive": true
    }
  }
}
```

### Key Settings Explained

- **androidScheme/iosScheme:** Use HTTPS to prevent CORS issues
- **hostname:** Custom hostname for the app's web content
- **SplashScreen:** 2-second display with brand colors
- **bundledWebRuntime:** false = smaller app size

---

## 🚀 Deployment Checklists

### Android - Google Play Store

1. **Prepare:**
   - [ ] Update version in `build.gradle`
   - [ ] Test on multiple Android devices/versions
   - [ ] Generate signed AAB (Android App Bundle)
   - [ ] Create app listing in Google Play Console

2. **Required Assets:**
   - [ ] App icon (512x512px)
   - [ ] Feature graphic (1024x500px)
   - [ ] Screenshots (phone + tablet, 2-8 images each)
   - [ ] Privacy policy URL
   - [ ] App description (short & full)

3. **Submit:**
   - [ ] Upload AAB to Play Console
   - [ ] Fill in all store listing details
   - [ ] Set content rating
   - [ ] Submit for review (typically 1-3 days)

### iOS - App Store

1. **Prepare:**
   - [ ] Update version in Xcode
   - [ ] Test on multiple iOS devices/versions
   - [ ] Archive and upload to App Store Connect
   - [ ] Create app record in App Store Connect

2. **Required Assets:**
   - [ ] App icon (1024x1024px)
   - [ ] Screenshots (all required device sizes)
   - [ ] App preview videos (optional but recommended)
   - [ ] Privacy policy URL
   - [ ] App description

3. **Submit:**
   - [ ] Upload build to App Store Connect
   - [ ] Fill in all app information
   - [ ] Set age rating
   - [ ] Submit for review (typically 1-3 days)

---

## 🔐 Permissions Configuration

### Android Permissions (AndroidManifest.xml)

Already configured:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

To add (if needed):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### iOS Permissions (Info.plist)

To add when needed:
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to update your profile picture</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select profile pictures</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby services</string>
```

---

## 📊 Testing Checklist

Before submitting to stores, test:

### Functionality
- [ ] Login/Logout works
- [ ] Booking flow completes successfully
- [ ] Payment integration works
- [ ] Product browsing and purchase
- [ ] Profile updates save correctly
- [ ] Push notifications (if implemented)
- [ ] Deep links work (appointment confirmations, etc.)

### UI/UX
- [ ] No horizontal scrolling
- [ ] All buttons/links are tappable (min 44x44pt on iOS, 48x48dp on Android)
- [ ] Forms are properly keyboard-aware
- [ ] Status bar looks correct
- [ ] Safe areas respected (no content under notches)
- [ ] Splash screen displays correctly
- [ ] App icon looks good on home screen

### Performance
- [ ] App launches quickly (< 3 seconds)
- [ ] Images load efficiently
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Back button works correctly (Android)

### Platforms
- [ ] Test on iOS 15+ devices
- [ ] Test on Android 10+ devices
- [ ] Test on tablets
- [ ] Test various screen sizes

---

## 🔄 Update Process

When you update the web app:

```bash
# 1. Make changes to React code

# 2. Build
npm run build

# 3. Sync to native projects
npx cap sync

# 4. Test
npx cap open android  # Test Android
npx cap open ios      # Test iOS

# 5. Increment version numbers in:
#    - android/app/build.gradle (versionCode & versionName)
#    - ios/App/App.xcodeproj (Version & Build)

# 6. Build release versions and upload to stores
```

---

## 🆘 Common Issues & Solutions

### Issue: "Unable to find xcodebuild"
**Solution:** Install Xcode from Mac App Store

### Issue: "CocoaPods not installed"
**Solution:** 
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

### Issue: Android Gradle sync fails
**Solution:**
- Update Android Studio to latest version
- File → Invalidate Caches → Invalidate and Restart
- Check JDK version is 17+

### Issue: White screen on app launch
**Solution:**
- Check browser console for errors: `npx cap serve`
- Ensure `npm run build` completed successfully
- Run `npx cap sync` again

### Issue: App Transport Security error (iOS)
**Solution:** Add to Info.plist:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>nobleelegance.co.uk</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <false/>
        </dict>
    </dict>
</dict>
```

---

## 📱 Deep Links / Universal Links

### Android Deep Links

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="https"
        android:host="www.nobleelegance.co.uk"
        android:pathPrefix="/appointment" />
    <data
        android:scheme="https"
        android:host="www.nobleelegance.co.uk"
        android:pathPrefix="/products" />
</intent-filter>
```

### iOS Universal Links

1. Create `apple-app-site-association` file on your server at:
   ```
   https://www.nobleelegance.co.uk/.well-known/apple-app-site-association
   ```

2. Content:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.uk.co.nobleelegance",
        "paths": ["/appointment/*", "/products/*", "/confirmation/*"]
      }
    ]
  }
}
```

3. Enable Associated Domains in Xcode:
   - Signing & Capabilities → + Capability → Associated Domains
   - Add: `applinks:www.nobleelegance.co.uk`

---

## 📚 Additional Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Android Developer:** https://developer.android.com
- **iOS Developer:** https://developer.apple.com
- **Play Store Guidelines:** https://play.google.com/console/about/guides/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/

---

## 🎯 Next Steps

1. **Create App Icons:**
   - Design 1024x1024px icon
   - Design 2732x2732px splash screen
   - Run `npx capacitor-assets generate`

2. **Test Thoroughly:**
   - Run on physical devices
   - Test all user flows
   - Check performance

3. **Set Up Store Accounts:**
   - Google Play Console ($25 one-time)
   - Apple Developer Program ($99/year)

4. **Submit:**
   - Follow deployment checklists above
   - Monitor review status
   - Respond to any feedback

---

## ✅ Current Status

- [x] Capacitor installed and configured
- [x] Android platform added
- [x] iOS platform added
- [x] Native plugins installed
- [x] Mobile optimizations implemented
- [ ] App icons and splash screens created
- [ ] Tested on physical devices
- [ ] Store accounts created
- [ ] Apps submitted to stores

---

**Last Updated:** November 22, 2025
**Contact:** Development Team
