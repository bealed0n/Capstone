import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // Al cargar la app, verificar si hay un usuario almacenado
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    console.log('Usuario cargado desde AsyncStorage:', parsedUser);
                    // Actualiza el estado solo si el usuario no es el mismo
                    setUser(parsedUser);
                    setIsLoggedIn(true);
                } else {
                    console.log('No hay usuario en AsyncStorage');
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.log('Error leyendo el estado de login:', error);
            } finally {
                setLoading(false);
            }
        };

        checkLoginStatus();
    }, []); // Solo se ejecuta una vez al inicio

    // Función para manejar el login exitoso
    const login = async (userData) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsLoggedIn(true);
        } catch (error) {
            console.log('Error guardando el estado de login:', error);
        }
    };

    // Función para manejar el logout
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            setUser(null);
            setIsLoggedIn(false);
            console.log('Usuario ha cerrado sesión');
        } catch (error) {
            console.log('Error cerrando sesión:', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, isLoggedIn, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};
