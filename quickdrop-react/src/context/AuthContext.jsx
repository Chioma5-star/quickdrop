import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../api/client';

const AuthContext = createContext(null);

// Kept in memory only (React state) — not localStorage, so this resets on
// page refresh. That's a deliberate simplification for this project stage;
// a "remember me" version would add token persistence in Level 3.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const handleAuthSuccess = useCallback((result) => {
    setToken(result.token);
    setUser(result.user);
  }, []);

  const signup = useCallback(
    async (formData) => {
      const result = await api.signup(formData);
      handleAuthSuccess(result);
      return result;
    },
    [handleAuthSuccess]
  );

  const login = useCallback(
    async (formData) => {
      const result = await api.login(formData);
      handleAuthSuccess(result);
      return result;
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = { token, user, signup, login, logout, isAuthenticated: Boolean(token) };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}