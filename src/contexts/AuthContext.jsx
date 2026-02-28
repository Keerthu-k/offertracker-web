import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authLogin,
  authRegister,
  getMe,
  getToken,
  setToken,
  clearToken,
  setStoredUser,
  getStoredUser,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getMe()
      .then((u) => {
        setUser(u);
        setStoredUser(u);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginFn = useCallback(async (email, password) => {
    const res = await authLogin({ email, password });
    setToken(res.access_token);
    setStoredUser(res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const registerFn = useCallback(async ({ email, username, password, display_name }) => {
    const res = await authRegister({ email, username, password, display_name });
    setToken(res.access_token);
    setStoredUser(res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    window.location.href = '/';
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await getMe();
    setUser(u);
    setStoredUser(u);
    return u;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login: loginFn, register: registerFn, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
