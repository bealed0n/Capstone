// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');  // Verificar si el usuario tiene un token de autenticación
  return token ? children : <Navigate to="/login" />;  // Redirigir a /login si no hay token
};

export default PrivateRoute;
