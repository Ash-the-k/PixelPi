import { createContext, useState, useEffect } from 'react';
import { adminApi } from '../api/admin';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: validate any stored token
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Token exists — validate it against the backend
    adminApi
      .status()
      .then((res) => {
        setToken(storedToken);
        // Backend may return { user } or the user object directly — handle both
        setUser(res.data?.user || res.data);
      })
      .catch(() => {
        // Token is invalid or expired
        localStorage.removeItem('admin_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (credentials) => {
    const res = await adminApi.login(credentials);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // Ignore logout errors — clear client state regardless
    }
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}