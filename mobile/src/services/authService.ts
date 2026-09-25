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

  async loginWithGoogle() {
    throw new Error('Not implemented.');
  },
};
