/**
 * Custom Expo config plugin to pre-bundle Ionicons font into the Android app.
 *
 * The expo-font plugin copies the file as "Ionicons.ttf" (preserving the original
 * filename). expo-font's native module (FontLoaderModule.kt) scans assets/fonts/ and
 * strips the extension to build the list returned by getLoadedFonts(). That gives
 * "Ionicons" (capital I), but @expo/vector-icons registers the font under the key
 * "ionicons" (lowercase) — so Font.isLoaded("ionicons") always returns false, causing
 * every Ionicons component to render a blank <Text /> on first mount.
 *
 * This plugin copies the font file as "ionicons.ttf" (all lowercase) so
 * getLoadedFonts() returns "ionicons", making Font.isLoaded("ionicons") return true
 * immediately on the first render — no async loading needed.
 */

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withIonicons(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const fontsDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/assets/fonts'
      );

      fs.mkdirSync(fontsDir, { recursive: true });

      const src = path.join(
        config.modRequest.projectRoot,
        'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
      );
      const dest = path.join(fontsDir, 'ionicons.ttf'); // lowercase — must match 'ionicons' key

      fs.copyFileSync(src, dest);

      return config;
    },
  ]);
};
