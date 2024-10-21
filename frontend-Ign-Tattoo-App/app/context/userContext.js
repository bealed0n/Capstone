import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Almacena el usuario logeado
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado del login
    const [loading, setLoading] = useState(true); // Estado de carga agregado

    // Al cargar la app, verificar si hay un usuario almacenado
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    console.log('Usuario cargado desde AsyncStorage:', parsedUser);
                    setUser(parsedUser);
                    setIsLoggedIn(true); // Marca al usuario como logueado
                } else {
                    console.log('No hay usuario en AsyncStorage');
                    setIsLoggedIn(false); // Si no hay usuario, no está logueado
                }
            } catch (error) {
                console.log('Error leyendo el estado de login:', error);
            } finally {
                setLoading(false); // Cambia el estado de loading una vez verificado
            }
        };

        checkLoginStatus();
    }, []); // Solo se ejecuta una vez al inicio

    // Función para manejar el login exitoso
    const login = async (userData) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData)); // Guardar el usuario en AsyncStorage
            setUser(userData);  // Actualiza el usuario en el estado
            setIsLoggedIn(true); // Marca al usuario como logueado
        } catch (error) {
            console.log('Error guardando el estado de login:', error);
        }
    };

    // Función para manejar el logout
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user'); // Eliminar el usuario de AsyncStorage
            setUser(null); // Limpiar el usuario en el estado
            setIsLoggedIn(false); // Cambiar el estado a no logueado
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
