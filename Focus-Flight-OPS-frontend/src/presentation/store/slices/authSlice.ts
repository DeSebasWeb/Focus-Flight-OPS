import { create } from 'zustand';
import { authApi, AuthResponse } from '../../../services/api/authApi';
import { tokenStorage } from '../../../services/auth/tokenStorage';

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
}

const ONBOARDING_KEY = 'focus_flight_onboarding_done';

interface AuthState {
  user: UserInfo | null;
  pilotId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  pilotId: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasCompletedOnboarding: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result: AuthResponse = await authApi.login(email, password);
      // Fetch full user profile after login
      const me = await authApi.getMe();
      set({
        user: {
          id: me.id,
          email: me.email,
          firstName: me.firstName,
          lastName: me.lastName,
          phone: me.phone,
          documentType: me.documentType,
          documentNumber: me.documentNumber,
        },
        pilotId: me.pilotId ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Error al iniciar sesion' });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result: AuthResponse = await authApi.register(data);
      set({
        user: result.user,
        pilotId: result.pilotId ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Error al registrarse' });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({
        user: null,
        pilotId: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    const token = await tokenStorage.getAccessToken();
    const onboardingDone = await tokenStorage.isOnboardingDone();
    if (!token) {
      set({ isAuthenticated: false, isLoading: false, hasCompletedOnboarding: onboardingDone });
      return;
    }
    try {
      const me = await authApi.getMe();
      set({
        user: {
          id: me.id,
          email: me.email,
          firstName: me.firstName,
          lastName: me.lastName,
          phone: me.phone,
          documentType: me.documentType,
          documentNumber: me.documentNumber,
        },
        pilotId: me.pilotId ?? null,
        isAuthenticated: true,
        isLoading: false,
        hasCompletedOnboarding: onboardingDone,
      });
    } catch {
      await tokenStorage.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false, hasCompletedOnboarding: onboardingDone });
    }
  },

  completeOnboarding: async () => {
    await tokenStorage.setOnboardingDone();
    set({ hasCompletedOnboarding: true });
  },

  clearError: () => set({ error: null }),
}));
