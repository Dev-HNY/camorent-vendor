# Camorent Mobile App (Expo) 📱

A professional React Native app built with Expo for camera equipment rental business.

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## ⚡ Installation & Running

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start the App

```bash
npm start
# or
npx expo start
```

This will open **Expo Dev Tools** in your browser and show a QR code.

---

## 📱 Running on Your Device

### Option 1: Physical Device (Recommended)

#### iOS (iPhone/iPad)
1. Install **Expo Go** from App Store
2. Open **Camera app**
3. Scan the QR code from your terminal
4. App will open in Expo Go

#### Android
1. Install **Expo Go** from Play Store
2. Open **Expo Go** app
3. Tap "Scan QR Code"
4. Scan the QR code from your terminal
5. App will load

### Option 2: iOS Simulator (macOS only)

```bash
npm run ios
```

Requirements:
- macOS
- Xcode installed

### Option 3: Android Emulator

```bash
npm run android
```

Requirements:
- Android Studio installed
- Android emulator running

### Option 4: Web Browser

```bash
npm run web
```

Opens app in your browser (some features may be limited).

---

## 📂 Project Structure

```
camorent-expo-app/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx          # Reusable button component
│   │   │   └── Logo.tsx            # Camorent logo
│   │   └── onboarding/
│   │       └── ImageCollage.tsx    # Artistic image layout
│   ├── screens/
│   │   └── CreateAccountScreen.tsx # Landing screen
│   ├── theme/
│   │   └── index.ts                # Design system
│   └── types/
│       └── index.ts                # TypeScript types
├── App.tsx                         # Entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

---

## 🎨 Current Screen

### Create Account Screen
- ✅ Camorent logo
- ✅ Welcome title
- ✅ Artistic image collage (5 photographer images)
- ✅ "Get Started" button
- ✅ Responsive design for all screen sizes

---

## 🔧 Development Commands

```bash
# Start development server
npm start

# Start on iOS simulator
npm run ios

# Start on Android emulator
npm run android

# Start in web browser
npm run web

# Clear cache and restart
npx expo start -c
```

---

## 🎯 Features Implemented

### ✅ Components
- **Button** - 3 variants (primary, secondary, outline)
- **Logo** - Customizable Camorent brand logo
- **ImageCollage** - Responsive overlapping image layout

### ✅ Design System
- Purple branding (#7C3AED)
- Consistent spacing
- Typography scale
- Color palette
- Shadow system

### ✅ TypeScript
- Full type coverage
- Interface definitions
- Type-safe props

---

## 🎨 Customization

### Change Brand Color

Edit `src/theme/index.ts`:

```typescript
colors: {
  primary: '#7C3AED', // Change this to your color
}
```

### Replace Images

Edit `src/screens/CreateAccountScreen.tsx`:

```typescript
const MOCK_IMAGES = [
  'YOUR_IMAGE_URL_1',
  'YOUR_IMAGE_URL_2',
  'YOUR_IMAGE_URL_3',
  'YOUR_IMAGE_URL_4',
  'YOUR_IMAGE_URL_5',
];
```

---

## 📱 Testing on Different Devices

The app is responsive and works on:
- ✅ iPhone SE (small screens)
- ✅ iPhone 15 Pro (standard)
- ✅ iPhone 15 Pro Max (large)
- ✅ Android small devices
- ✅ Android large devices
- ✅ Tablets (iPad, Android tablets)

---

## 🐛 Troubleshooting

### Issue: QR Code doesn't work

**Solution:**
- Make sure phone and computer are on same WiFi
- Try closing Expo Go and scanning again
- Use tunnel mode: `npx expo start --tunnel`

### Issue: App not updating

**Solution:**
```bash
# Clear cache
npx expo start -c

# Or shake device and tap "Reload"
```

### Issue: Images not loading

**Solution:**
- Check internet connection
- Images require internet to load from Unsplash

### Issue: "Cannot find module" error

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

---

## 📚 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Hooks** - State management

---

## 🔜 Next Steps

Add more screens:
1. Sign Up Screen
2. Sign In Screen
3. Home Screen
4. Equipment Listing
5. Booking Flow

---

## 📖 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🆘 Need Help?

### Common Questions

**Q: How do I add a new screen?**
A: Create a new file in `src/screens/` and import it in `App.tsx`

**Q: How do I add navigation?**
A: Install React Navigation:
```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

**Q: Can I test without a phone?**
A: Yes! Use iOS Simulator (Mac) or Android Emulator, or test in web browser with `npm run web`

---

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] `npm install` completed without errors
- [ ] `npm start` opens Expo dev tools
- [ ] QR code appears in terminal
- [ ] App loads on your phone via Expo Go
- [ ] Can see Camorent logo
- [ ] Images load properly
- [ ] Button responds to touch
- [ ] Alert appears when clicking "Get Started"

---

## 🎉 You're All Set!

Your app is running! You should see:
1. Purple Camorent logo at top
2. "Create a Account with Camorent" title
3. 5 overlapping photographer images
4. Purple "Get Started" button at bottom

**Press the button to test the interaction!**

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Make sure all prerequisites are installed
3. Try clearing cache: `npx expo start -c`

---

**Built with ❤️ for Camorent**
