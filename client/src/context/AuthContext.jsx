import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roleProfile, setRoleProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await authAPI.me();
      setUser(data.user);
      setRoleProfile(data.roleProfile || null);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setRoleProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setRoleProfile(null);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setRoleProfile(null);
    return data.user;
  };

  const refreshUser = async () => {
    const { data } = await authAPI.me();
    setUser(data.user);
    setRoleProfile(data.roleProfile || null);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await authAPI.updateMe(payload);
    setUser(data.user);
    setRoleProfile(data.roleProfile || null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setRoleProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      roleProfile,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      isAuthenticated: Boolean(user)
    }),
    [user, roleProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
