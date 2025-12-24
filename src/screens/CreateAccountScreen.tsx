/**
 * Create Account Screen
 * Landing/Onboarding screen for Camorent app
 * Displays brand identity and call-to-action
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { ImageCollage } from '../components/onboarding/ImageCollage';
import { theme } from '../theme';
import type { CreateAccountScreenNavigationProp } from '../navigation/types';

export const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<CreateAccountScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('LocationSelection');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.primary}
      />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Logo size={80} />
          <Text style={styles.title}>
            Create an Account with{'\n'}Camorent
          </Text>
        </View>

        {/* Image Collage Section */}
        <View style={styles.collageSection}>
          <ImageCollage />
        </View>

        {/* Footer Section with CTA */}
        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    lineHeight: theme.typography.fontSize.xxxl * theme.typography.lineHeight.tight,
  },
  collageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: Platform.OS === 'android' ? theme.spacing.lg : theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
});
