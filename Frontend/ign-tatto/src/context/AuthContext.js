import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = cookies.get('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const login = (token) => {
    cookies.set('token', token);
    const decodedToken = jwtDecode(token);
    setUserRole(decodedToken.role);
  };

  const logout = () => {
    cookies.remove('token');
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};