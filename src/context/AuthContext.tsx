/**
 * Global Authentication Context for Obsidian Cinema
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/index.ts';
import { api, getClientToken, setClientToken } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await api.auth.me();
      setUser(data.user);
    } catch (_) {
      setUser(null);
      setClientToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if token exists or cookies are available
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await api.auth.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const data = await api.auth.register(name, email, password);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (_) {
      // Ignore
    }
    setUser(null);
    setClientToken(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
