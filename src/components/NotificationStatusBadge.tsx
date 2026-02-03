/**
 * Notification Status Badge
 * Shows a small badge indicating push notification status
 * Optional component - can be added to settings or profile screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNotification } from '../context/NotificationContext';

export const NotificationStatusBadge: React.FC = () => {
  const { expoPushToken } = useNotification();

  const isEnabled = !!expoPushToken;

  return (
    <View style={[styles.container, isEnabled ? styles.enabled : styles.disabled]}>
      <View style={[styles.dot, isEnabled ? styles.dotEnabled : styles.dotDisabled]} />
      <Text style={styles.text}>
        {isEnabled ? 'Notifications Active' : 'Notifications Unavailable (Expo Go)'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  enabled: {
    backgroundColor: '#E8F5E9',
  },
  disabled: {
    backgroundColor: '#FFF3E0',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotEnabled: {
    backgroundColor: '#4CAF50',
  },
  dotDisabled: {
    backgroundColor: '#FF9800',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
