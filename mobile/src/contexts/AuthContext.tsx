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
  firstName: string;
  initials: string;
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
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredData() {
      const { token, user: storedUser } = await storage.getAuthData();
      if (storedUser) {
        const payload = token ? parseJwt(token) : null;
        const resolvedName =
          storedUser.name ||
          storedUser.nome ||
          payload?.name ||
          '';

        setUser({
          ...storedUser,
          name: resolvedName,
        });
      }
      setIsLoading(false);
    }
    loadStoredData();
  }, []);

  const signIn = async (credentials: SignInCredentials) => {
    const response = await authService.login(credentials);

    const { access_token: token, refresh_token: refreshToken, user: rawUser } = response;
    const userData: User = {
      id: rawUser.id,
      email: rawUser.email,
      profile: rawUser.profile,
      name: rawUser.name || rawUser.nome || '',
    };

    await storage.saveAuthData(
      String(token),
      userData,
      refreshToken ? String(refreshToken) : undefined,
    );
    setUser(userData);
  };

  const signInWithToken = async (token: string, refreshToken?: string) => {
    const payload = parseJwt(token);

    const userData: User = {
      id: payload?.sub || '',
      email: payload?.email || '',
      profile: payload?.role || 'ALUNO',
      name: payload?.name || (payload?.email ? payload.email.split('@')[0] : ''),
    };

    await storage.saveAuthData(token, userData, refreshToken);
    setUser(userData);
  };

  const signOut = async () => {
    await storage.clearAuthData();
    setUser(null);
  };

  const getFirstName = (): string => {
    const trimmedName = user?.name?.trim();
    if (trimmedName) {
      return trimmedName.split(/\s+/)[0];
    }
    if (user?.profile === 'PROFESSOR') return 'Professor';
    if (user?.profile === 'TECNICO') return 'Técnico';
    return 'Usuário';
  };

  const getInitials = (): string => {
    const trimmedName = user?.name?.trim();
    if (trimmedName) {
      const names = trimmedName.split(/\s+/);
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return trimmedName.substring(0, 2).toUpperCase();
    }
    if (user?.profile === 'PROFESSOR') return 'PR';
    if (user?.profile === 'TECNICO') return 'TC';
    return 'US';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firstName: getFirstName(),
        initials: getInitials(),
        isLoading,
        signIn,
        signInWithToken,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
