# 📁 PROJECT STRUCTURE

```
camorent-expo-app/
│
├── 📱 App.tsx                          # Main entry point
├── 📋 app.json                         # Expo configuration
├── 📦 package.json                     # Dependencies
├── ⚙️ tsconfig.json                    # TypeScript config
├── 🔧 babel.config.js                  # Babel config
├── 📖 README.md                        # Full documentation
├── 🚀 QUICK_START.md                   # 3-step setup guide
│
├── 📂 src/                             # Source code
│   │
│   ├── 📂 components/                  # Reusable components
│   │   ├── 📂 common/                  # Generic components
│   │   │   ├── Button.tsx              # ✅ Reusable button (3 variants)
│   │   │   └── Logo.tsx                # ✅ Camorent logo
│   │   │
│   │   ├── 📂 onboarding/              # Onboarding components
│   │   │   └── ImageCollage.tsx        # ✅ Artistic image layout
│   │   │
│   │   └── index.ts                    # Component exports
│   │
│   ├── 📂 screens/                     # App screens
│   │   └── CreateAccountScreen.tsx     # ✅ Landing screen
│   │
│   ├── 📂 theme/                       # Design system
│   │   └── index.ts                    # ✅ Colors, spacing, typography
│   │
│   └── 📂 types/                       # TypeScript types
│       └── index.ts                    # ✅ Type definitions
│
└── 📂 assets/                          # Images, icons, fonts
    └── README.md                       # Assets documentation

```

---

## 🎯 Key Files to Know

### 1. **App.tsx** - Start Here!
The main entry point. Currently shows `CreateAccountScreen`.

### 2. **src/screens/CreateAccountScreen.tsx**
The landing screen you see when you run the app.

### 3. **src/theme/index.ts**
Change brand colors, spacing, fonts here.

### 4. **package.json**
All dependencies. Run `npm install` to install.

### 5. **app.json**
Expo configuration (app name, icon, splash screen).

---

## 📱 Component Hierarchy

```
App.tsx
  └── CreateAccountScreen
       ├── Logo (purple circle)
       ├── Text (title)
       ├── ImageCollage
       │    ├── Image (top-left)
       │    ├── Image (top-right)
       │    ├── Image (center)
       │    ├── Image (bottom-left)
       │    └── Image (bottom-right)
       └── Button ("Get Started")
```

---

## 🎨 Design System

All design tokens live in `src/theme/index.ts`:

- **Colors**: Primary purple, backgrounds, text colors
- **Spacing**: 4, 8, 16, 24, 32, 48 px
- **Typography**: Font sizes, weights, line heights
- **Border Radius**: Rounded corners
- **Shadows**: Drop shadows for depth

---

## ✨ Reusable Components

### Button (`src/components/common/Button.tsx`)
```typescript
<Button 
  title="Get Started" 
  onPress={handlePress}
  variant="primary"    // primary | secondary | outline
  size="large"         // small | medium | large
  fullWidth
/>
```

### Logo (`src/components/common/Logo.tsx`)
```typescript
<Logo size={80} />
```

### ImageCollage (`src/components/onboarding/ImageCollage.tsx`)
```typescript
<ImageCollage images={[...5 image URLs]} />
```

---

## 📝 TypeScript Types

All types are in `src/types/index.ts`:
- ButtonProps
- LogoProps
- ImageCollageProps
- User, Equipment, Booking (for future API)

---

## 🚀 To Run

```bash
# Install
npm install

# Start
npm start

# Scan QR code with Expo Go app on your phone!
```

---

## 🎯 Next Steps

To add a new screen:

1. Create file in `src/screens/`
2. Import components from `src/components/`
3. Use theme from `src/theme/`
4. Add types to `src/types/`
5. Update `App.tsx` to show new screen

---

**Everything is organized and ready to scale!** 🎉
