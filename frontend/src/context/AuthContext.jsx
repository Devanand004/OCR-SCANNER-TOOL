import { useState } from 'react';
import { login as loginApi, register as registerApi } from '../services/api';
import { AuthContext } from './useAuth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    return (savedUser && token) ? { username: savedUser } : null;
  });
  const isLoading = false;

  const login = async (username, password) => {
    const response = await loginApi(username, password);
    const { token } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setUser({ username });
    return response.data;
  };

  const register = async (username, email, password) => {
    return await registerApi(username, email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
