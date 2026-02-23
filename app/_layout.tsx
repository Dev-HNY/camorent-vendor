/**
 * Root Layout for Expo Router
 * Sets up the navigation structure and providers
 * Wraps app with Theme and Language context providers
 */

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from '../src/store/userStore';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/context/ThemeContext';
import { LanguageProvider } from '../src/context/LanguageContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { GlobalNotificationHandler } from '../src/components/GlobalNotificationHandler';
import { NavigationBarThemeProvider } from '../src/components/NavigationBarThemeProvider';
import ErrorBoundary from '../src/components/common/ErrorBoundary';
import { disableConsoleInProduction } from '../src/utils/productionLogger';

// Disable console.log in production
disableConsoleInProduction();

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { sessionExpired, clearSessionExpired } = useUserStore();
  const [fontsLoaded, fontError] = useFonts({
    'Geist-Regular': require('../assets/fonts/Geist-Regular.otf'),
    'Geist-Medium': require('../assets/fonts/Geist-Medium.otf'),
    'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.otf'),
    'Geist-Bold': require('../assets/fonts/Geist-Bold.otf'),
    'ionicons': require('../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // When token refresh fails anywhere in the app, redirect to login
  useEffect(() => {
    if (sessionExpired) {
      clearSessionExpired();
      router.replace('/login');
    }
  }, [sessionExpired]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <NavigationBarThemeProvider>
            <LanguageProvider>
              <NotificationProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="auth-choice" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="location-selection" />
                  <Stack.Screen name="sign-in" />
                  <Stack.Screen name="verification" />
                  <Stack.Screen name="otp-verification" />
                  <Stack.Screen name="address-setup" />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="profile" />
                  <Stack.Screen name="support" />
                  <Stack.Screen name="owner-selection" />
                  <Stack.Screen name="product-selection" />
                  <Stack.Screen name="date-selection" />
                  <Stack.Screen name="booking-summary" />
                  <Stack.Screen name="order-detail" />
                  <Stack.Screen name="request-detail" />
                  <Stack.Screen name="confirm-pickup" />
                  <Stack.Screen name="confirm-return" />
                  <Stack.Screen name="scan-challan" />
                  <Stack.Screen name="scan-product" />
                  <Stack.Screen name="return-scan-challan" />
                  <Stack.Screen name="return-scan-product" />
                  <Stack.Screen name="verify-pickup-otp" />
                  <Stack.Screen name="verify-return-otp" />
                  <Stack.Screen name="wishlist" />
                  <Stack.Screen name="history" />
                  <Stack.Screen name="forgot-password" />
                  <Stack.Screen name="reset-password-otp" />
                  <Stack.Screen name="new-password" />
                  <Stack.Screen name="verify-otp" />
                </Stack>
                {/* Global Notification Handler */}
                <GlobalNotificationHandler />
              </NotificationProvider>
            </LanguageProvider>
          </NavigationBarThemeProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
