import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfileData } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('token')));

  const saveToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  // If we already have a token, load profile once on app startup.
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const result = await getProfileData();
        setUser(result?.data?.user || result?.data || result?.user || null);
      } catch (error) {
        logout();
      } finally {
        setAuthLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (newToken, userFromResponse = null) => {
    saveToken(newToken);

    if (userFromResponse) {
      setUser(userFromResponse);
      return;
    }

    try {
      const result = await getProfileData();
      setUser(result?.data?.user || result?.data || result?.user || null);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser,
    }),
    [token, user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
