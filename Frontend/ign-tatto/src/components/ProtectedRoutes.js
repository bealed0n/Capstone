// src/components/ProtectedRoutes.js
import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importación como exportación con nombre

export const ProtectedRoutes = ({ allowedRole, element }) => {
    const token = Cookies.get('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    try {
        const decodedToken = jwtDecode(token);
        console.log('Token Decodificado:', decodedToken); // Para depuración

        // Verificar si el token ha expirado
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
            return <Navigate to="/login" />;
        }

        if (decodedToken.role === allowedRole) {
            return element;
        } else {
            return <Navigate to="/" />;
        }
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return <Navigate to="/login" />;
    }
};