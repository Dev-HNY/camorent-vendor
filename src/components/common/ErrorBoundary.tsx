/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 * Displays fallback UI instead of crashing the entire app
 * Industry-grade crash handling for production
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Animated error icon component
const AnimatedErrorIcon = () => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <View style={styles.errorIcon}>
        <Text style={styles.errorIconText}>!</Text>
      </View>
    </Animated.View>
  );
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error for debugging
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // TODO: Send to crash reporting service (Sentry, Firebase, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.content}
          >
            <AnimatedErrorIcon />

            <Animated.Text
              entering={FadeInDown.delay(100).duration(300)}
              style={styles.title}
            >
              Oops! Something went wrong
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(200).duration(300)}
              style={styles.message}
            >
              We apologize for the inconvenience. Please try again.
            </Animated.Text>

            {/* Show error details in development */}
            {(__DEV__ || this.props.showDetails) && this.state.error && (
              <Animated.View
                entering={FadeInDown.delay(300).duration(300)}
                style={styles.detailsContainer}
              >
                <Text style={styles.detailsTitle}>Error Details:</Text>
                <Text style={styles.detailsText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.stackText} numberOfLines={5}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(400).duration(300)}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel="Try again"
                accessibilityRole="button"
                accessibilityHint="Attempts to reload the component"
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: width * 0.85,
  },
  iconContainer: {
    marginBottom: 24,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  errorIconText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#EF4444',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Geist-Bold' : 'Geist-Bold',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Geist-Regular' : 'Geist-Regular',
  },
  detailsContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Geist-SemiBold' : 'Geist-SemiBold',
  },
  detailsText: {
    fontSize: 12,
    color: '#B91C1C',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stackText: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  retryButton: {
    backgroundColor: '#565CAA',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    ...Platform.select({
      ios: {
        shadowColor: '#565CAA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Geist-SemiBold' : 'Geist-SemiBold',
  },
});

export default ErrorBoundary;
