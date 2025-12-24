# Assets Folder

This folder should contain your app icons and splash screen.

## Required Files (For Production)

For now, Expo will use default icons. To customize:

### icon.png
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Your app icon

### splash.png
- Size: 1284x2778 pixels (or larger)
- Format: PNG
- Your splash screen

### adaptive-icon.png (Android)
- Size: 1024x1024 pixels
- Format: PNG with transparency

### favicon.png (Web)
- Size: 48x48 pixels
- Format: PNG

## Current Status

The app will work fine without these files during development. Expo will provide default placeholders.

## To Add Custom Icons

1. Create your icon files in the sizes above
2. Place them in this `assets/` folder
3. Restart the Expo dev server

The app in `app.json` is already configured to look for these files!
