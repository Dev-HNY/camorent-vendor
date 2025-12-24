/**
 * App.tsx
 * Main application entry point for Expo
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingNavigator } from './src/navigation';

export default function App() {
  return (
    <NavigationContainer>
      <OnboardingNavigator />
    </NavigationContainer>
  );
}
