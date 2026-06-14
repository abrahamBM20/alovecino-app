import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginService, logoutService, refreshSessionService } from '../features/auth/services/authService';
import { mapApiError } from '../shared/api/errorMapper';

const { persist, createJSONStorage } = require('zustand/middleware');

function extractRoleFromToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const bin = atob(b64);
    const json = decodeURIComponent(
      bin.split('').map((c) => '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2)).join(''),
    );
    const payload = JSON.parse(json);
    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const raw = roles[0] ?? '';
    return raw.replace('ROLE_', '') || null;
  } catch {
    return null;
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      status: 'unauthenticated',
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      isLoading: false,
      error: null,
      async login(credentials) {
        set({ isLoading: true, error: null });

        try {
          const response = await loginService(credentials);
          set({
            status: 'authenticated',
            user: response.user,
            role: extractRoleFromToken(response.accessToken),
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            accessTokenExpiresAt: response.accessTokenExpiresAt ?? null,
            refreshTokenExpiresAt: response.refreshTokenExpiresAt ?? null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            status: 'unauthenticated',
            user: null,
            role: null,
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            isLoading: false,
            error: mapApiError(error),
          });
          throw error;
        }
      },
      async refreshSession() {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) {
          get().clearSession();
          throw new Error('Refresh token no disponible');
        }

        const response = await refreshSessionService({ refreshToken: currentRefreshToken });
        const nextUser = response.user ?? get().user;
        set({
          status: 'authenticated',
          user: nextUser,
          role: extractRoleFromToken(response.accessToken) ?? get().role,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          accessTokenExpiresAt: response.accessTokenExpiresAt ?? null,
          refreshTokenExpiresAt: response.refreshTokenExpiresAt ?? null,
          isLoading: false,
          error: null,
        });

        return response.accessToken;
      },
      async logout() {
        try {
          await logoutService(get().refreshToken);
        } catch {
          // Local logout still wins if the server-side session is already gone.
        }

        get().clearSession();
      },
      clearSession() {
        set({
          status: 'unauthenticated',
          user: null,
          role: null,
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
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
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
      }),
    },
  ),
);
