import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginService, logoutService } from '../features/auth/services/authService';
import { mapApiError } from '../shared/api/errorMapper';

const { persist, createJSONStorage } = require('zustand/middleware');

export const useAuthStore = create(
  persist(
    (set) => ({
      status: 'unauthenticated',
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,
      async login(credentials) {
        set({ isLoading: true, error: null });

        try {
          const response = await loginService(credentials);
          set({
            status: 'authenticated',
            user: response.user,
            accessToken: response.accessToken,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            status: 'unauthenticated',
            user: null,
            accessToken: null,
            isLoading: false,
            error: mapApiError(error),
          });
          throw error;
        }
      },
      async logout() {
        try {
          await logoutService();
        } catch {
          // Local logout still wins if the server-side session is already gone.
        }

        set({
          status: 'unauthenticated',
          user: null,
          accessToken: null,
          error: null,
        });
      },
      clearError() {
        set({ error: null });
      },
    }),
    {
      name: 'alovecino-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        status: state.status,
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
