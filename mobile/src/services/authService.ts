import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { api } from './api';

export interface LoginCredentials {
  email: string;
  password?: string;
  profile: 'ALUNO' | 'PROFESSOR' | 'TECNICO';
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(name: string, email: string, password: string) {
    const response = await api.post('/auth/register', { name, email, password });

    return response.data;
  },

  async loginWithGoogle() {
    const redirectUrl = makeRedirectUri({
      path: 'oauth-success',
    });

    const backendAuthUrl = `${api.defaults.baseURL}/auth/google?state=${encodeURIComponent(redirectUrl)}`;

    const result = await WebBrowser.openAuthSessionAsync(backendAuthUrl, redirectUrl);

    if (result.type === 'success' && result.url) {
      const urlObj = new URL(result.url);
      const token = urlObj.searchParams.get('token');

      if (!token) {
        throw new Error('Token não retornado pelo servidor');
      }

      return token;
    }

    throw new Error('Login cancelado ou interrompido');
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async verifyCode(email: string, code: string) {
    const response = await api.post('/auth/verify-code', { email, code });
    return response.data;
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },
};
