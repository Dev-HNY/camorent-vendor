/**
 * Custom hook to handle Android Navigation Bar theming
 * Sets the navigation bar background color based on the current theme
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { useTheme } from '../context/ThemeContext';

export function useNavigationBarTheme() {
  const { theme, themeMode } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      const updateNavigationBar = async () => {
        try {
          // Use the default export function directly
          await changeNavigationBarColor(
            theme.colors.background.primary,
            themeMode === 'light', // light theme = dark icons
            true // animated
          );
        } catch (error) {
          // Silently fail - navigation bar theming is not critical
          // Only log in development
          if (__DEV__) {
            console.log('Navigation bar theme update skipped:', error);
          }
        }
      };

      updateNavigationBar();
    }
  }, [theme.colors.background.primary, themeMode]);
}
