/**
 * Notification Module Loader
 * Safely loads expo-notifications with error suppression for Expo Go
 */

// Suppress console errors for notification module loading
const originalError = console.error;
let Notifications: any = null;
let isAvailable = false;

// Temporarily suppress errors during module load
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  // Suppress specific expo-notifications errors
  if (
    message.includes('expo-notifications') ||
    message.includes('removed from Expo Go') ||
    message.includes('Cannot read property') ||
    message.includes('prototype')
  ) {
    return; // Silently ignore these errors
  }
  originalError(...args);
};

try {
  Notifications = require('expo-notifications');
  isAvailable = true;
} catch (error) {
  // Module not available
  isAvailable = false;
}

// Restore console.error
console.error = originalError;

export { Notifications, isAvailable };
