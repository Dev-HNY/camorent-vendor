/**
 * Navigation Bar Theme Provider
 * Automatically updates Android navigation bar theme based on app theme
 * Note: This requires a development build - won't work in Expo Go
 */

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Dynamically import to handle cases where native module isn't available
let changeNavigationBarColor: ((color: string, light?: boolean, animated?: boolean) => Promise<void>) | null = null;

try {
  changeNavigationBarColor = require('react-native-navigation-bar-color').default;
} catch {
  // Module not available (e.g., in Expo Go)
}

export function NavigationBarThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, themeMode } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android' && changeNavigationBarColor) {
      const navBarColorFn = changeNavigationBarColor; // Capture in local const for type safety
      const updateNavigationBar = async () => {
        try {
          // Set navigation bar background color based on theme
          // Second parameter: light = true means use dark icons, light = false means use light icons
          await navBarColorFn(
            theme.colors.background.primary,
            themeMode === 'light', // light theme = dark icons, dark theme = light icons
            true // animated transition
          );
        } catch {
          // Silently fail - navigation bar theming is not critical
          // This can fail in Expo Go or if native module isn't properly linked
        }
      };

      updateNavigationBar();
    }
  }, [theme.colors.background.primary, themeMode]);

  return <>{children}</>;
}
