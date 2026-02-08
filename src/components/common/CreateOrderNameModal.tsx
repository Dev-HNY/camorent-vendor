import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { bookingService } from '../../services/api';
import { AnimatedModal } from './AnimatedModal';

interface CreateOrderNameModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateOrder: (orderName: string) => void;
}

// Modern SVG Icons
const CheckCircleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12L11 14L15 10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AlertCircleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 8V12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FileTextIcon = ({ color = '#565CAA', size = 48 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 13H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 9H9H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const XIcon = ({ color = '#000', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Generate default order name
const generateDefaultOrderName = (): string => {
  const timestamp = Date.now();
  return `ORD-${timestamp}`;
};

export const CreateOrderNameModal: React.FC<CreateOrderNameModalProps> = ({
  visible,
  onClose,
  onCreateOrder,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [orderName, setOrderName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Generate default name when modal opens
  useEffect(() => {
    if (visible) {
      const defaultName = generateDefaultOrderName();
      setOrderName(defaultName);
    }
  }, [visible]);

  // Validate order name with debouncing
  const validateOrderName = async (name: string) => {
    if (!name.trim()) {
      setValidationStatus('idle');
      setValidationMessage('');
      return;
    }

    try {
      setIsValidating(true);
      setValidationStatus('idle');

      const response = await bookingService.checkOrderName(name.trim());

      if (response.is_available) {
        setValidationStatus('valid');
        setValidationMessage(response.message);
      } else {
        setValidationStatus('invalid');
        setValidationMessage(response.message);
      }
    } catch (error: any) {
      setValidationStatus('invalid');
      setValidationMessage('Failed to validate order name. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Debounced validation on order name change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      validateOrderName(orderName);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [orderName]);

  const handleCreate = () => {
    if (orderName.trim() && validationStatus === 'valid') {
      onCreateOrder(orderName.trim());
      setOrderName('');
      setValidationStatus('idle');
      setValidationMessage('');
    }
  };

  const handleClose = () => {
    setOrderName('');
    setValidationStatus('idle');
    setValidationMessage('');
    onClose();
  };

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedModal visible={visible} onClose={handleClose} position="center" closeOnBackdropPress={true}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.background.secondary }]}
            onPress={handleClose}
          >
            <XIcon color={theme.colors.text.secondary} size={20} />
          </TouchableOpacity>

          {/* Icon Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.iconContainer}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
              <FileTextIcon color={theme.colors.primary} size={48} />
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(150).duration(400)}
            style={[styles.title, { color: theme.colors.text.primary }]}
          >
            {t.common.createOrderName}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(400)}
            style={[styles.subtitle, { color: theme.colors.text.secondary }]}
          >
            {t.common.enterUniqueName}
          </Animated.Text>

          {/* Input field */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.background.secondary,
                  borderColor:
                    validationStatus === 'invalid'
                      ? '#EF4444'
                      : validationStatus === 'valid'
                      ? '#22C55E'
                      : isFocused
                      ? theme.colors.primary
                      : 'transparent',
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                value={orderName}
                onChangeText={setOrderName}
                placeholder="ORD-1234567890"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={50}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {/* Validation indicator */}
              <View style={styles.validationIndicator}>
                {isValidating && <ActivityIndicator size="small" color={theme.colors.primary} />}
                {!isValidating && validationStatus === 'valid' && <CheckCircleIcon size={24} />}
                {!isValidating && validationStatus === 'invalid' && <AlertCircleIcon size={24} />}
              </View>
            </View>

            {/* Validation message */}
            {validationMessage && !isValidating && (
              <Animated.Text
                entering={FadeInDown.duration(200)}
                style={[
                  styles.validationText,
                  validationStatus === 'valid' && styles.validationTextValid,
                  validationStatus === 'invalid' && styles.validationTextInvalid,
                ]}
              >
                {validationMessage}
              </Animated.Text>
            )}

            <Text style={[styles.helperText, { color: theme.colors.text.tertiary }]}>
              {t.common.autoGeneratedName}
            </Text>
          </Animated.View>

          {/* Create button */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                onPress={handleCreate}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={validationStatus !== 'valid' || isValidating}
                style={({ pressed }) => [pressed && { opacity: 0.9 }]}
              >
                <LinearGradient
                  colors={
                    validationStatus === 'valid' && !isValidating
                      ? [theme.colors.primary, '#4B4F8C']
                      : [theme.colors.text.tertiary, theme.colors.text.tertiary]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createButton}
                >
                  {isValidating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.createButtonText}>{isValidating ? t.common.validatingName : t.common.createOrder}</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </AnimatedModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 14,
    paddingRight: 40,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  validationIndicator: {
    position: 'absolute',
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  validationTextValid: {
    color: '#22C55E',
  },
  validationTextInvalid: {
    color: '#EF4444',
  },
  helperText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#565CAA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
