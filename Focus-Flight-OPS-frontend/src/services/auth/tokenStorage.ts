import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'focus_flight_access_token';
const REFRESH_TOKEN_KEY = 'focus_flight_refresh_token';
const ONBOARDING_DONE_KEY = 'focus_flight_onboarding_done';

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },

  async isOnboardingDone(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(ONBOARDING_DONE_KEY);
    return value === 'true';
  },

  async setOnboardingDone(): Promise<void> {
    await SecureStore.setItemAsync(ONBOARDING_DONE_KEY, 'true');
  },
};
