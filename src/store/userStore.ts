/**
 * User Store
 * Zustand store for managing user profile data
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email?: string; // Email for signup/login
  password?: string; // Temporarily stored during signup for OTP verification
  contactNo: string;
  workExperience: string;
  organization: string;
  gstNo: string;
  panNo: string; // PAN number
  dateOfBirth: string; // Format: "DD/MM/YYYY" for PAN verification
  frontIdImage: string | null;
  backIdImage: string | null;
  isVerified: boolean;
  gstVerified: boolean; // GST verification status
  panVerified: boolean; // PAN verification status
  // Address fields (detailed structure)
  addressId?: string; // Reference to the address in backend
  hasAddress: boolean; // Whether user has completed address setup
}

interface UserState {
  user: UserProfile | null;
  sessionExpired: boolean;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  clearUserProfile: () => void;
  isAuthenticated: () => boolean;
  forceLogout: () => void;
  clearSessionExpired: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionExpired: false,

      setUserProfile: (profile) =>
        set({
          user: {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email,
            password: profile.password,
            contactNo: profile.contactNo || '',
            workExperience: profile.workExperience || '',
            organization: profile.organization || '',
            gstNo: profile.gstNo || '',
            panNo: profile.panNo || '',
            dateOfBirth: profile.dateOfBirth || '',
            frontIdImage: profile.frontIdImage || null,
            backIdImage: profile.backIdImage || null,
            isVerified: profile.isVerified || false,
            gstVerified: profile.gstVerified || false,
            panVerified: profile.panVerified || false,
            addressId: profile.addressId,
            hasAddress: profile.hasAddress || false,
          },
        }),

      updateUserProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearUserProfile: () => set({ user: null }),

      forceLogout: () => set({ user: null, sessionExpired: true }),

      clearSessionExpired: () => set({ sessionExpired: false }),

      isAuthenticated: () => {
        const { user } = get();
        return user !== null && user.isVerified;
      },
    }),
    {
      name: 'camorent-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
