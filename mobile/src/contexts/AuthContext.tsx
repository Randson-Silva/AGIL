import { authService } from '@/services/authService';
import React, { createContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';

export interface User {
  id: string;
  name: string;
  email: string;
  profile: 'TECNICO' | 'PROFESSOR' | 'ALUNO';
}

export interface SignInCredentials {
  email: string;
  password: string;
  profile: 'TECNICO' | 'PROFESSOR' | 'ALUNO';
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredData() {
      const { user: storedUser } = await storage.getAuthData();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    }
    loadStoredData();
  }, []);

  const signIn = async (credentials: SignInCredentials) => {
    const response = await authService.login(credentials);

    const { access_token: token, user: userData } = response;

    await storage.saveAuthData(String(token), userData);
    setUser(userData);
  };

  const signInWithToken = async (token: string) => {
    const payload = parseJwt(token);

    const userData: User = {
      id: payload?.sub || '',
      email: payload?.email || '',
      profile: payload?.role || 'ALUNO',
      name: payload?.email ? payload.email.split('@')[0] : 'Usuário',
    };

    await storage.saveAuthData(token, userData);
    setUser(userData);
  };

  const signOut = async () => {
    await storage.clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInWithToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
