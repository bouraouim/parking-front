import React, {createContext, useState, useContext, useEffect} from 'react';
import apiService from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await apiService.getAuthToken();
      const userData = await apiService.getUserData();
      const url = await apiService.getServerUrl();

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
      }

      if (url) {
        setServerUrl(url);
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    const result = await apiService.login(username, password);

    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.data.user);
      return {success: true};
    }

    return {success: false, error: result.error};
  };

  const logout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const setServer = async url => {
    await apiService.setServerUrl(url);
    setServerUrl(url);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        serverUrl,
        login,
        logout,
        setServer,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
