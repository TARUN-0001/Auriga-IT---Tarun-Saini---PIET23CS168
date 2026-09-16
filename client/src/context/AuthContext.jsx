import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('habit_tracker_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('habit_tracker_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const saveSession = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('habit_tracker_user', JSON.stringify(userData));
    localStorage.setItem('habit_tracker_token', authToken);
  };

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    saveSession(response.user, response.token);
    return response;
  };

  const register = async (credentials) => {
    const response = await registerUser(credentials);
    saveSession(response.user, response.token);
    return response;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('habit_tracker_user');
    localStorage.removeItem('habit_tracker_token');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user && !!token,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
