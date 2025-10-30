import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextProps {
  token: string | null;
  role: string | null;
  setAuth: (token: string | null, role: string | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  role: null,
  setAuth: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedRole = await AsyncStorage.getItem('role');
      setToken(storedToken);
      setRole(storedRole);
    };
    loadAuth();
  }, []);

  const setAuth = async (newToken: string | null, newRole: string | null) => {
    if (newToken) {
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('role', newRole || '');
    } else {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
    }
    setToken(newToken);
    setRole(newRole);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
