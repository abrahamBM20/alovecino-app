import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginService } from '../features/auth/services/authService';
import { mapApiError } from '../shared/api/errorMapper';

export const useAuthStore = create(
  persist(
    (set) => ({
      status: 'unauthenticated',
      user: null,
      token: null,
      isLoading: false,
      error: null,
      async login(credentials) {
        set({ isLoading: true, error: null });

        try {
          const response = await loginService(credentials);
          set({
            status: 'authenticated',
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            status: 'unauthenticated',
            user: null,
            token: null,
            isLoading: false,
            error: mapApiError(error),
          });
          throw error;
        }
      },
      logout() {
        set({
          status: 'unauthenticated',
          user: null,
          token: null,
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
        token: state.token,
      }),
    },
  ),
);
