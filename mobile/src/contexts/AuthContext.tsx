import React, { createContext, useEffect, useState } from 'react';
import { api } from '../services/api';
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
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

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
    const response = await api.post('/auth/login', credentials);
    const { access_token: token, user: userData } = response.data;

    await storage.saveAuthData(String(token), JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async () => {
    await storage.clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
