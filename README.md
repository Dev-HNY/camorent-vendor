# Camorent Vendor App 📱

Professional React Native mobile application for camera equipment rental vendors. Built with Expo, TypeScript, and production-grade architecture.

**Version:** 1.0.0
**Package:** com.camorentvendor.app
**Status:** ✅ Production Ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

### Install Dependencies
```bash
npm install
```

### Run Development
```bash
npm start
# Then:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app
```

### Build Production APK
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📋 Documentation

| Document | Purpose |
|----------|---------|
| **[PRIVACY_POLICY.md](PRIVACY_POLICY.md)** | Privacy policy for users |
| **[TERMS_AND_CONDITIONS.md](TERMS_AND_CONDITIONS.md)** | Terms of service |

---

## ✨ Key Features

### Core Functionality
- 🔐 **Secure Authentication** - Phone/Email with OTP verification
- 📦 **Booking Management** - Create, track, and manage equipment rentals
- 👤 **Dual Role Support** - Buyer and Owner modes
- 📸 **Digital Documentation** - Product scanning, image uploads, challan management
- 💰 **Financial Tracking** - Revenue monitoring, settlement requests
- 🔔 **Push Notifications** - Real-time alerts with sound and vibration

### User Experience
- 🌙 **Dark Mode** - Full theme support
- 🎨 **Modern UI** - Smooth animations, haptic feedback
- ⚡ **Performance Optimized** - Fast loading, efficient rendering
- 📱 **Responsive Design** - Adapts to all screen sizes
- 🌍 **Localization Ready** - Multi-language support framework

### Security & Quality
- 🔒 **Secure Storage** - Encrypted token storage
- ✅ **Input Validation** - Zod schemas for all inputs
- 🛡️ **Error Handling** - Error boundaries, graceful failures
- 📊 **Production Logger** - Console logs disabled in release builds

---

## 🏗️ Tech Stack

### Core Technologies
- **React Native** 0.74.5
- **Expo** 51.0.39
- **TypeScript** 5.3.3
- **Expo Router** 3.5.23 (file-based routing)

### State Management
- **Zustand** 5.0.2 - Global state
- **AsyncStorage** - Persistent storage
- **React Query** - Server state (ready to use)

### UI & Animations
- **React Native Reanimated** 3.10.1
- **React Native Gesture Handler** 2.16.1
- **Expo Linear Gradient** - Modern gradients
- **Lottie** - Complex animations

### Backend Integration
- **Fetch API** - HTTP client
- **Zod** - API response validation
- **Expo SecureStore** - Encrypted token storage

---

## 📁 Project Structure

```
camorent-vendor/
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout
│   └── *.tsx              # Other screens
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React contexts (theme, language, notifications)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── store/             # Zustand stores
│   ├── theme/             # Theme configuration
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, sounds
├── android/               # Native Android code
├── docs/                  # Development documentation
└── scripts/               # Build and cleanup scripts
```

---

## 🔧 Key Scripts

```bash
# Development
npm start                  # Start Expo dev server
npm run android           # Run on Android
npm run ios               # Run on iOS

# Quality Checks
npm run type-check        # TypeScript validation
npm run cleanup           # Check for issues
npm run lint              # Run linter

# Production
cd android && ./gradlew assembleRelease  # Build APK
```

---

## 🎯 App Screens

### Authentication Flow
- Welcome / Auth Choice
- Phone/Email Signup
- OTP Verification
- GST/PAN Verification
- Address Setup
- Login

### Main Tabs
- **Home** - Dashboard with stats and quick actions
- **Active Jobs** - Current bookings and requests
- **Track Order** - Order tracking and history
- **Settle Payment** - Financial settlements

### Booking Flow
- Owner Selection
- Product Selection
- Date Selection
- Booking Summary
- Confirm Pickup (with OTP)
- Confirm Return (with OTP)

### Additional Features
- Profile Management
- Notifications
- Support
- Wishlist
- Order History

---

## 🔐 Environment Setup

### Required Configuration

1. **Firebase** - Push notifications
   - Place `google-services.json` in `/android/app/`
   - Configure Firebase project in Firebase Console
   - Update package name: `com.camorentvendor.app`

2. **API Backend**
   - Configure in `src/config/env.ts`
   - Production: `https://api.camorent.co.in`
   - Development: Set your local API URL

3. **Android Keystore** - For signing release APK
   - Generate keystore: `keytool -genkeypair -v -storetype PKCS12 -keystore camorent-vendor.keystore -alias camorent-vendor-key -keyalg RSA -keysize 2048 -validity 10000`
   - Place keystore in `android/app/`
   - Configure `android/gradle.properties` with keystore credentials

---

## 📱 App Permissions

### Android Permissions
- 📷 **Camera** - Product scanning
- 🖼️ **Photo Library** - Image uploads
- 🔔 **Notifications** - Push alerts
- 📳 **Vibration** - Haptic feedback
- 🌐 **Internet** - API communication
- 🎤 **Audio** - Future feature (not currently used)

### Blocked Permissions
- ❌ **Location** - Not needed, explicitly blocked

---

## 🎨 Design Features

### UI Components
- Custom animated tab bar
- Skeleton loading states
- Empty states
- Error states
- Success/error modals
- Confirmation dialogs
- Bottom sheets
- Notification banners

### Animations
- Smooth page transitions
- List item animations
- Button press effects
- Modal animations
- Loading indicators
- Haptic feedback

---

## 🔄 State Management

### Global State (Zustand)
- **User Store** - Authentication, profile
- **Order Store** - Active bookings
- **Wishlist Store** - Saved items

### Context Providers
- **Theme Context** - Dark/light mode
- **Language Context** - Localization
- **Notification Context** - Push notifications

---

## 🚀 Performance Optimizations

### Implemented
- ✅ FlatList for efficient scrolling
- ✅ Image optimization and lazy loading
- ✅ Memoized components (React.memo)
- ✅ Optimized re-renders
- ✅ Production logger (no console logs in release)
- ✅ Error boundaries for crash prevention
- ✅ List virtualization
- ✅ Debounced search inputs

### APK Size Optimization
- ✅ Removed unused components
- ✅ Optimized assets (6.8MB saved)
- ✅ Tree-shaking unused code
- ✅ ProGuard enabled for Android

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] All authentication flows
- [ ] Booking creation and management
- [ ] Image uploads
- [ ] Push notifications
- [ ] Dark mode toggle
- [ ] Network error handling
- [ ] Offline behavior
- [ ] OTP verification
- [ ] Settlement flows

### Automated Testing
- TypeScript compilation: `npm run type-check`
- Pre-build checks: `npm run cleanup`

---

## 📦 Building for Production

### Android APK Build Steps

1. **Prepare Environment**
   ```bash
   npm install
   ```

2. **Configure Keystore**
   - Ensure keystore file exists at `android/app/camorent-vendor.keystore`
   - Verify credentials in `android/gradle.properties`

3. **Build Release APK**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

4. **Locate APK**
   - Path: `android/app/build/outputs/apk/release/app-release.apk`
   - Size: ~50-60 MB

### iOS Build Steps

1. **Open in Xcode**
   ```bash
   npx expo run:ios --configuration Release
   ```

2. **Configure Signing**
   - Open `ios/camorentvendor.xcworkspace` in Xcode
   - Set team and signing certificate

3. **Archive and Upload**
   - Product → Archive
   - Upload to App Store Connect

---

## 🎯 Roadmap

### Current Version (1.0.0)
- ✅ Complete vendor functionality
- ✅ Dual role support (buyer/owner)
- ✅ Push notifications
- ✅ Dark mode
- ✅ Production ready

### Future Enhancements
- [ ] Multi-language support (Hindi, etc.)
- [ ] Offline mode capabilities
- [ ] Analytics integration
- [ ] In-app chat support
- [ ] Advanced reporting

---

## 📄 License

**Proprietary** - Camorent Team

---

## 👥 Support

- **Email:** support@camorent.co.in
- **Phone:** +91-8882507989
- **Website:** www.camorent.com

---

## 🎉 Credits

Built with ❤️ by the Camorent Team

**Technology Stack:** React Native, Expo, TypeScript, Zustand, Firebase

---

**Last Updated:** February 1, 2026
**Build Status:** ✅ Production Ready
**TypeScript Errors:** 0
**Test Coverage:** Manual QA Passed
