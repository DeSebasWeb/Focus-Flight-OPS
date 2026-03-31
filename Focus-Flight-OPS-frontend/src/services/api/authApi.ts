import apiClient from './apiClient';
import { tokenStorage } from '../auth/tokenStorage';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

export interface AuthResponse {
  user: { id: string; email: string; firstName: string; lastName: string };
  tokens: { accessToken: string; refreshToken: string };
  pilotId?: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const result = await apiClient.post('/auth/register', data);
    await tokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
    return result;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await apiClient.post('/auth/login', { email, password });
    await tokenStorage.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
    return result;
  },

  async getMe(): Promise<any> {
    return apiClient.get('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await tokenStorage.clearTokens();
    }
  },
};
