/**
 * Auth Choice Screen
 * Initial screen where users choose to Login or Sign Up
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '../src/components/common/Button';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';

export default function AuthChoiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme: appTheme, themeMode } = useTheme();
  const { t } = useTranslation();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/location-selection');
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: appTheme.colors.background.primary, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.logoContainer}>
          <Image
            source={require('../assets/icon-blue.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.logoText, { color: appTheme.colors.primary }]}>Camorent</Text>
          <Text style={[styles.tagline, { color: appTheme.colors.text.secondary }]}>{t.auth.vendorPortal}</Text>
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.welcomeContainer}>
          <Text style={[styles.title, { color: appTheme.colors.text.primary }]}>{t.auth.welcome}</Text>
          <Text style={[styles.subtitle, { color: appTheme.colors.text.secondary }]}>
            {t.auth.manageEquipmentRentals}
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.buttonContainer}>
          <Button
            title={t.auth.login}
            onPress={handleLogin}
            variant="primary"
            fullWidth
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: appTheme.colors.border.light }]} />
            <Text style={[styles.dividerText, { color: appTheme.colors.text.tertiary }]}>{t.auth.or}</Text>
            <View style={[styles.dividerLine, { backgroundColor: appTheme.colors.border.light }]} />
          </View>

          <Button
            title={t.auth.createAccount}
            onPress={handleSignUp}
            variant="secondary"
            fullWidth
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.footer}>
          <Text style={[styles.footerText, { color: appTheme.colors.text.tertiary }]}>
            {t.auth.byContinuing}{'\n'}
            <Text style={[styles.footerLink, { color: appTheme.colors.primary }]}>{t.auth.termsOfService}</Text> {t.auth.and}{' '}
            <Text style={[styles.footerLink, { color: appTheme.colors.primary }]}>{t.auth.privacyPolicy}</Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 32 : 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 32 : 24,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontWeight: '600',
  },
});
