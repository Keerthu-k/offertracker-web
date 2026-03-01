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

function normalizeAuthPayload(payload) {
  const accessToken =
    payload?.access_token ??
    payload?.accessToken ??
    payload?.token ??
    payload?.data?.access_token ??
    payload?.data?.accessToken ??
    payload?.data?.token ??
    null;

  const user = payload?.user ?? payload?.data?.user ?? null;

  if (!accessToken) {
    throw new Error('Login succeeded but no access token was returned.');
  }
  if (!user) {
    throw new Error('Login succeeded but no user profile was returned.');
  }

  return { accessToken, user };
}

export function AuthProvider({ children }) {
  const hasToken = !!getToken();
  // Don't trust cached user when a token needs validation — keep user null
  // until getMe() succeeds. This prevents child components from rendering
  // and firing API calls with an expired token.
  const [user, setUser] = useState(() => (hasToken ? null : getStoredUser()));
  const [loading, setLoading] = useState(hasToken);

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
    const { accessToken, user } = normalizeAuthPayload(res);
    setToken(accessToken);
    setStoredUser(user);
    setUser(user);
    return user;
  }, []);

  const registerFn = useCallback(async ({ email, username, password, display_name }) => {
    const res = await authRegister({ email, username, password, display_name });
    const { accessToken, user } = normalizeAuthPayload(res);
    setToken(accessToken);
    setStoredUser(user);
    setUser(user);
    return user;
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
