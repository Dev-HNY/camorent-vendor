/**
 * Navigation Type Definitions
 * TypeScript types for type-safe navigation
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the param list for the onboarding stack
export type OnboardingStackParamList = {
  CreateAccount: undefined;
  LocationSelection: undefined;
  SignIn: undefined;
  Verification: undefined;
  OTPVerification: undefined;
  // Add more onboarding screens here as needed
};

// Navigation prop types for each screen
export type CreateAccountScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CreateAccount'
>;

export type LocationSelectionScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'LocationSelection'
>;

export type SignInScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'SignIn'
>;

export type VerificationScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Verification'
>;

export type OTPVerificationScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'OTPVerification'
>;
