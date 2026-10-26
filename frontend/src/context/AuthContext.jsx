import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vibevault_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vibevault_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem('vibevault_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('vibevault_user', JSON.stringify(res.data.user));
          // If user has a preferred mood, update local storage cache too
          if (res.data.user.preferredMood) {
            localStorage.setItem('vibevault_mood', res.data.user.preferredMood);
          }
        }
      } catch (err) {
        console.warn('Authentication check failed:', err.message);
        localStorage.removeItem('vibevault_token');
        localStorage.removeItem('vibevault_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('vibevault_token', receivedToken);
    localStorage.setItem('vibevault_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    if (receivedUser.preferredMood) {
      localStorage.setItem('vibevault_mood', receivedUser.preferredMood);
    }
    return receivedUser;
  };

  const register = async (name, email, password, preferredMood) => {
    const res = await api.post('/auth/register', { name, email, password, preferredMood });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('vibevault_token', receivedToken);
    localStorage.setItem('vibevault_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    if (receivedUser.preferredMood) {
      localStorage.setItem('vibevault_mood', receivedUser.preferredMood);
    }
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('vibevault_token');
    localStorage.removeItem('vibevault_user');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data) => {
    const res = await api.patch('/users/me', data);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem('vibevault_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const deleteAccount = async () => {
    await api.delete('/users/me');
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
