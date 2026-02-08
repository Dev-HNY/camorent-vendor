/**
 * Sign In Screen - Modern Registration
 * User registration form for Camorent with backend connectivity
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
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
import { validatePhoneNumber, validateName } from '../src/utils/validation';
import { authService } from '../src/services/api';
import { SuccessModal } from '../src/components';

// Modern SVG Icons
const UserIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MailIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M22 6L12 13L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme: appTheme, themeMode } = useTheme();
  const { t } = useTranslation();
  const setUserProfile = useUserStore((state) => state.setUserProfile);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [contactNoError, setContactNoError] = useState('');

  // Animation values
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword &&
      contactNo.trim() !== '' &&
      validatePhoneNumber(contactNo) &&
      validateName(firstName) &&
      validateName(lastName) &&
      validateEmail(email) &&
      passwordRegex.test(password)
    );
  };

  const handleSignIn = async () => {
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setContactNoError('');

    let hasError = false;

    if (firstName.trim() === '') {
      setFirstNameError('First name is required');
      hasError = true;
    } else if (!validateName(firstName)) {
      setFirstNameError('Please enter a valid first name (letters only)');
      hasError = true;
    }

    if (lastName.trim() === '') {
      setLastNameError('Last name is required');
      hasError = true;
    } else if (!validateName(lastName)) {
      setLastNameError('Please enter a valid last name (letters only)');
      hasError = true;
    }

    if (email.trim() === '') {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (password.trim() === '') {
      setPasswordError('Password is required');
      hasError = true;
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setPasswordError('Must have: 8+ chars, uppercase, lowercase, number, symbol');
        hasError = true;
      }
    }

    if (confirmPassword.trim() === '') {
      setConfirmPasswordError('Confirm password is required');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (contactNo.trim() === '') {
      setContactNoError('Contact number is required');
      hasError = true;
    } else if (!validatePhoneNumber(contactNo)) {
      if (contactNo.length !== 10) {
        setContactNoError('Phone number must be exactly 10 digits');
      } else {
        setContactNoError('Please enter a valid phone number');
      }
      hasError = true;
    }

    if (hasError) return;

    if (isFormValid()) {
      try {
        setIsLoading(true);

        const formattedPhone = `+91${contactNo}`;

        // Request SMS OTP for signup (MessageCentral)
        const response = await authService.signUpWithSMS({
          phone_number: formattedPhone,
          password: password,
          email: email,
          first_name: firstName,
          last_name: lastName,
        });

        // Store signup data in user store for OTP verification screen
        setUserProfile({
          firstName,
          lastName,
          email,
          contactNo: formattedPhone,
          workExperience: '',
          organization: '', // Will be auto-filled from GST verification
          gstNo: '',
          frontIdImage: null,
          backIdImage: null,
          isVerified: false,
          hasAddress: false,
          // Store password temporarily for auto-login after OTP verification
          password: password,
        });

        setSuccessMessage(response.message || 'OTP sent to your phone via SMS!');
        setShowSuccessModal(true);
      } catch (error: any) {
        // Check if user already exists
        if (error.message?.includes('already registered') || error.message?.includes('user_exists')) {
          setErrorMessage('This phone number is already registered. Please use the Login option instead.');
        } else {
          setErrorMessage(error.message || 'Unable to sign up. Please try again.');
        }

        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15 });
  };

  // Render input field with icon
  const renderInputField = ({
    icon,
    iconColor,
    label,
    value,
    onChangeText,
    placeholder,
    error,
    fieldName,
    keyboardType = 'default' as any,
    autoCapitalize = 'none' as any,
    secureTextEntry = false,
    showToggle = false,
    toggleValue = false,
    onToggle = () => {},
    multiline = false,
  }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: appTheme.colors.text.secondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: appTheme.colors.background.secondary,
            borderColor: error ? appTheme.colors.status.error : focusedField === fieldName ? appTheme.colors.primary : 'transparent',
          },
          multiline && styles.inputWrapperMultiline,
        ]}
      >
        <View style={[styles.inputIconContainer, { backgroundColor: iconColor + '15' }]}>{icon}</View>
        <TextInput
          style={[
            styles.input,
            { color: appTheme.colors.text.primary },
            multiline && styles.inputMultiline,
            showToggle && styles.inputWithToggle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={appTheme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry && !toggleValue}
          editable={!isLoading}
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField(null)}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {showToggle && (
          <TouchableOpacity style={styles.eyeButton} onPress={onToggle}>
            {toggleValue ? (
              <EyeIcon color={appTheme.colors.text.tertiary} size={20} />
            ) : (
              <EyeOffIcon color={appTheme.colors.text.tertiary} size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={[styles.errorText, { color: appTheme.colors.status.error }]}>{error}</Text> : null}
    </View>
  );

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
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.headerContainer}>
            <View style={[styles.logoWrapper, { backgroundColor: appTheme.colors.primary + '15' }]}>
              <Image source={require('../assets/icon-blue.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={[styles.title, { color: appTheme.colors.text.primary }]}>{t.auth.createAccount}</Text>
            <Text style={[styles.subtitle, { color: appTheme.colors.text.secondary }]}>
              {t.auth.enterDetails}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
            {/* Name Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfField}>
                {renderInputField({
                  icon: <UserIcon color={appTheme.colors.primary} size={18} />,
                  iconColor: appTheme.colors.primary,
                  label: t.auth.firstName,
                  value: firstName,
                  onChangeText: (text: string) => {
                    setFirstName(text);
                    if (firstNameError) setFirstNameError('');
                  },
                  placeholder: t.auth.enterFirstName,
                  error: firstNameError,
                  fieldName: 'firstName',
                  autoCapitalize: 'words',
                })}
              </View>
              <View style={styles.halfField}>
                {renderInputField({
                  icon: <UserIcon color={appTheme.colors.accent.purple} size={18} />,
                  iconColor: appTheme.colors.accent.purple,
                  label: t.auth.lastName,
                  value: lastName,
                  onChangeText: (text: string) => {
                    setLastName(text);
                    if (lastNameError) setLastNameError('');
                  },
                  placeholder: t.auth.enterLastName,
                  error: lastNameError,
                  fieldName: 'lastName',
                  autoCapitalize: 'words',
                })}
              </View>
            </View>

            {/* Email */}
            {renderInputField({
              icon: <MailIcon color={appTheme.colors.accent.amber} size={18} />,
              iconColor: appTheme.colors.accent.amber,
              label: t.auth.email,
              value: email,
              onChangeText: (text: string) => {
                setEmail(text.toLowerCase());
                if (emailError) setEmailError('');
              },
              placeholder: t.auth.enterEmail,
              error: emailError,
              fieldName: 'email',
              keyboardType: 'email-address',
            })}

            {/* Password */}
            {renderInputField({
              icon: <LockIcon color={appTheme.colors.accent.green} size={18} />,
              iconColor: appTheme.colors.accent.green,
              label: t.auth.password,
              value: password,
              onChangeText: (text: string) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
                if (confirmPasswordError && confirmPassword !== '') setConfirmPasswordError('');
              },
              placeholder: t.auth.enterPassword,
              error: passwordError,
              fieldName: 'password',
              secureTextEntry: true,
              showToggle: true,
              toggleValue: showPassword,
              onToggle: () => setShowPassword(!showPassword),
            })}

            {/* Confirm Password */}
            {renderInputField({
              icon: <LockIcon color={appTheme.colors.status.info} size={18} />,
              iconColor: appTheme.colors.status.info,
              label: t.auth.confirmPassword,
              value: confirmPassword,
              onChangeText: (text: string) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              },
              placeholder: t.auth.enterConfirmPassword,
              error: confirmPasswordError,
              fieldName: 'confirmPassword',
              secureTextEntry: true,
              showToggle: true,
              toggleValue: showConfirmPassword,
              onToggle: () => setShowConfirmPassword(!showConfirmPassword),
            })}

            {/* Phone Number */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: appTheme.colors.text.secondary }]}>{t.auth.phoneNumber}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: appTheme.colors.background.secondary,
                    borderColor: contactNoError ? appTheme.colors.status.error : focusedField === 'phone' ? appTheme.colors.primary : 'transparent',
                  },
                ]}
              >
                <View style={[styles.inputIconContainer, { backgroundColor: appTheme.colors.status.error + '15' }]}>
                  <PhoneIcon color={appTheme.colors.status.error} size={18} />
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
                    if (contactNoError) setContactNoError('');
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
          </Animated.View>

          {/* Create Account Button */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.buttonContainer}>
            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                onPress={handleSignIn}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={!isFormValid() || isLoading}
                style={({ pressed }) => [pressed && { opacity: 0.9 }]}
              >
                <LinearGradient
                  colors={
                    isFormValid() && !isLoading
                      ? [appTheme.colors.primary, appTheme.colors.primaryDark]
                      : [appTheme.colors.text.tertiary, appTheme.colors.text.tertiary]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.submitButton, { shadowColor: appTheme.colors.primary }]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={appTheme.colors.text.inverse} size="small" />
                  ) : (
                    <>
                      <Text style={[styles.submitButtonText, { color: appTheme.colors.text.inverse }]}>{t.auth.createAccount}</Text>
                      <ArrowRightIcon color={appTheme.colors.text.inverse} size={20} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Login Link */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: appTheme.colors.text.secondary }]}>{t.auth.alreadyHaveAccount} </Text>
            <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
              <Text style={[styles.loginLink, { color: appTheme.colors.primary }]}>{t.auth.login}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/otp-verification');
        }}
        title="Success"
        message={successMessage}
        primaryButtonText="OK"
        icon="success"
      />

      {/* Error Modal */}
      <SuccessModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Sign Up Failed"
        message={errorMessage}
        primaryButtonText="Try Again"
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
    marginTop: Platform.OS === 'android' ? 30 : 10,
    marginBottom: 30,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
  },
  form: {
    marginBottom: 24,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  inputWithToggle: {
    paddingRight: 0,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  flag: {
    width: 22,
    height: 15,
    marginRight: 6,
    borderRadius: 2,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputDivider: {
    width: 1,
    height: 22,
    marginRight: 10,
  },
  eyeButton: {
    padding: 10,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownMenu: {
    marginTop: -8,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
