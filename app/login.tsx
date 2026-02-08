/**
 * Login Screen
 * Modern UI for existing vendor users to login
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from '../src/context/LanguageContext';
import { useUserStore } from '../src/store/userStore';
import { validatePhoneNumber } from '../src/utils/validation';
import { authService } from '../src/services/api';
import { SuccessModal } from '../src/components';
import { useNotification } from '../src/context/NotificationContext';

// Modern SVG Icons
const PhoneIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27099 2.12 4.18C2.09501 3.90347 2.12787 3.62476 2.2165 3.36162C2.30513 3.09849 2.44757 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.11 2H7.11C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.11 3.72C9.23662 4.68007 9.47144 5.62273 9.81 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LockIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EyeOffIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArrowRightIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 5L19 12L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme: appTheme, themeMode } = useTheme();
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);
  const setUserProfile = useUserStore((state) => state.setUserProfile);
  const { registerPushToken } = useNotification();

  const [contactNo, setContactNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contactNoError, setContactNoError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  // Animation values
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isFormValid = () => {
    return contactNo.trim() !== '' && password.trim() !== '' && validatePhoneNumber(contactNo);
  };

  const handleLogin = async () => {
    setContactNoError('');
    setPasswordError('');

    let hasError = false;

    if (!validatePhoneNumber(contactNo)) {
      if (contactNo.length !== 10) {
        setContactNoError('Phone number must be exactly 10 digits');
      } else {
        setContactNoError('Please enter a valid phone number');
      }
      hasError = true;
    }

    if (password.trim() === '') {
      setPasswordError('Please enter your password');
      hasError = true;
    }

    if (!hasError && isFormValid()) {
      try {
        setIsLoading(true);

        const formattedPhone = `+91${contactNo}`;

        const response = await authService.login({
          phone_number: formattedPhone,
          password: password,
        });

        const vendorUser = response.vendor_user;
        setUserProfile({
          firstName: vendorUser.first_name || '',
          lastName: vendorUser.last_name || '',
          contactNo: formattedPhone,
          workExperience: user?.workExperience || '',
          organization: vendorUser.company_name || '',
          gstNo: vendorUser.GSTIN_no || '',
          frontIdImage: user?.frontIdImage || null,
          backIdImage: user?.backIdImage || null,
          isVerified: true,
          gstVerified: !!vendorUser.GSTIN_no,
          addressId: vendorUser.address_id,
          hasAddress: !!vendorUser.address_id,
        });

        // Register push notification token now that user is logged in
        try {
          await registerPushToken();
        } catch (error) {
          // Push token registration skipped - not critical
        }

        setSuccessMessage(t.login.welcome_back_vendor.replace('{name}', vendorUser.first_name || 'Vendor'));
        setShowSuccessModal(true);
      } catch (error: any) {
        setErrorMessage(error.message || 'Invalid credentials. Please try again.');
        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/sign-in');
  };

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15 });
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: appTheme.colors.background.primary, paddingTop: insets.top }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.headerContainer}>
            <View style={[styles.logoWrapper, { backgroundColor: appTheme.colors.primary + '15' }]}>
              <Image source={require('../assets/icon-blue.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={[styles.title, { color: appTheme.colors.text.primary }]}>{t.auth.welcomeBack}</Text>
            <Text style={[styles.subtitle, { color: appTheme.colors.text.secondary }]}>
              {t.auth.loginToAccount}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
            {/* Phone Number Input */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: appTheme.colors.text.secondary }]}>{t.auth.phoneNumber}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: appTheme.colors.background.secondary,
                    borderColor:
                      contactNoError
                        ? '#EF4444'
                        : focusedField === 'phone'
                        ? appTheme.colors.primary
                        : 'transparent',
                  },
                ]}
              >
                <View style={[styles.inputIconContainer, { backgroundColor: appTheme.colors.primary + '15' }]}>
                  <PhoneIcon color={appTheme.colors.primary} size={18} />
                </View>
                <View style={styles.countryCode}>
                  <Image source={{ uri: 'https://flagcdn.com/w40/in.png' }} style={styles.flag} />
                  <Text style={[styles.countryCodeText, { color: appTheme.colors.text.primary }]}>+91</Text>
                </View>
                <View style={[styles.inputDivider, { backgroundColor: appTheme.colors.border.light }]} />
                <TextInput
                  style={[styles.input, { color: appTheme.colors.text.primary }]}
                  placeholder="9876543210"
                  placeholderTextColor={appTheme.colors.text.tertiary}
                  value={contactNo}
                  onChangeText={(text) => {
                    setContactNo(text.replace(/[^0-9]/g, ''));
                    setContactNoError('');
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isLoading}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {contactNoError ? <Text style={styles.errorText}>{contactNoError}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: appTheme.colors.text.secondary }]}>{t.auth.password}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: appTheme.colors.background.secondary,
                    borderColor:
                      passwordError
                        ? '#EF4444'
                        : focusedField === 'password'
                        ? appTheme.colors.primary
                        : 'transparent',
                  },
                ]}
              >
                <View style={[styles.inputIconContainer, { backgroundColor: '#8B5CF6' + '15' }]}>
                  <LockIcon color="#8B5CF6" size={18} />
                </View>
                <TextInput
                  style={[styles.input, styles.passwordInput, { color: appTheme.colors.text.primary }]}
                  placeholder={t.auth.enterPassword}
                  placeholderTextColor={appTheme.colors.text.tertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeIcon color={appTheme.colors.text.tertiary} size={20} />
                  ) : (
                    <EyeOffIcon color={appTheme.colors.text.tertiary} size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword} disabled={isLoading}>
              <Text style={[styles.forgotPasswordText, { color: appTheme.colors.primary }]}>{t.auth.forgotPassword}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Login Button */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.buttonContainer}>
            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                onPress={handleLogin}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={!isFormValid() || isLoading}
                style={({ pressed }) => [pressed && { opacity: 0.9 }]}
              >
                <LinearGradient
                  colors={
                    isFormValid() && !isLoading
                      ? [appTheme.colors.primary, '#4B4F8C']
                      : [appTheme.colors.text.tertiary, appTheme.colors.text.tertiary]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color={appTheme.colors.text.inverse} size="small" />
                  ) : (
                    <>
                      <Text style={[styles.loginButtonText, { color: appTheme.colors.text.inverse }]}>{t.auth.login}</Text>
                      <ArrowRightIcon color={appTheme.colors.text.inverse} size={20} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: appTheme.colors.text.secondary }]}>{t.auth.dontHaveAccount} </Text>
            <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
              <Text style={[styles.signUpLink, { color: appTheme.colors.primary }]}>{t.auth.signUp}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // Smart routing based on user completion status
          if (!user?.gstVerified) {
            // User hasn't completed GST verification
            router.replace('/verification');
          } else if (!user?.hasAddress) {
            // User hasn't completed address setup
            router.replace('/address-setup');
          } else {
            // User has completed everything
            router.replace('/(tabs)/home');
          }
        }}
        title={t.login.success_title}
        message={successMessage || t.login.success_message}
        primaryButtonText={t.common.continue}
        icon="success"
      />

      {/* Error Modal */}
      <SuccessModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={t.login.failed_title}
        message={errorMessage || t.login.failed_message}
        primaryButtonText={t.buttons.try_again}
        icon="error"
      />


    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 20,
    marginBottom: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 32,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  inputIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 6,
    borderRadius: 2,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputDivider: {
    width: 1,
    height: 24,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    paddingRight: 16,
  },
  passwordInput: {
    paddingLeft: 12,
  },
  eyeButton: {
    padding: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 15,
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
