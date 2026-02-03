// Global polyfills for React Native/Hermes
import { decode, encode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Polyfill atob and btoa
if (typeof global.atob === 'undefined') {
  global.atob = decode;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = encode;
}

// Polyfill localStorage using AsyncStorage
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: async (key) => await AsyncStorage.getItem(key),
    setItem: async (key, value) => await AsyncStorage.setItem(key, value),
    removeItem: async (key) => await AsyncStorage.removeItem(key),
    clear: async () => await AsyncStorage.clear(),
  };
}

// Import the Expo entry point
import 'expo-router/entry';
