/**
 * Support Screen
 * Contact information for Camorent support team
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { ScreenHeader } from '../src/components';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useTranslation();


  const handleCallPress = () => {
    Linking.openURL('tel:8882507989');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:supportvendor@camorent.co.in');
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.colors.background.primary, paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        {/* Header */}
        <ScreenHeader title={t.support.title} />

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={styles.icon}>🎧</Text>
          </View>

          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t.support.needHelp}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {t.support.contactTeam}
          </Text>

          {/* Contact Card */}
          <View style={[styles.contactCard, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.border.light }]}>
            {/* Phone */}
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleCallPress}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={styles.contactIcon}>📞</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: theme.colors.text.secondary }]}>{t.support.phoneNumber}</Text>
                <Text style={[styles.contactValue, { color: theme.colors.text.primary }]}>8882507989</Text>
              </View>
              <Text style={[styles.arrow, { color: theme.colors.text.tertiary }]}>→</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />

            {/* Email */}
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleEmailPress}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.background.secondary }]}>
                <Text style={styles.contactIcon}>✉️</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: theme.colors.text.secondary }]}>{t.support.email}</Text>
                <Text style={[styles.contactValue, { color: theme.colors.text.primary }]}>supportvendor@camorent.co.in</Text>
              </View>
              <Text style={[styles.arrow, { color: theme.colors.text.tertiary }]}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpTextContainer}>
            <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
              {t.support.available247}
            </Text>
          </View>
        </View>
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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  contactCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 32,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactIcon: {
    fontSize: 24,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  helpTextContainer: {
    paddingHorizontal: 16,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
