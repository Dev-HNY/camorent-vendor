/**
 * Onboarding Navigator
 * Stack navigator for the account creation flow
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateAccountScreen } from '../screens/CreateAccountScreen';
import { LocationSelectionScreen } from '../screens/LocationSelectionScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { VerificationScreen } from '../screens/VerificationScreen';
import { OTPVerificationScreen } from '../screens/OTPVerificationScreen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CreateAccount"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
      />
      <Stack.Screen
        name="LocationSelection"
        component={LocationSelectionScreen}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
      />
      <Stack.Screen
        name="Verification"
        component={VerificationScreen}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
      />
    </Stack.Navigator>
  );
};
