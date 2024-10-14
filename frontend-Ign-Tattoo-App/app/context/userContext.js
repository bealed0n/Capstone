// UserContext.js
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
                    console.log('Usuario cargado desde AsyncStorage:', parsedUser); // Agregar este log
                    setUser(parsedUser);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.log('Error leyendo el estado de login:', error);
            } finally {
                setLoading(false);
            }
        };

        checkLoginStatus();
    }, []);


    // Función para manejar el login exitoso
    const login = async (userData) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData)); // Guardar el usuario en AsyncStorage
            setUser(userData);
            setIsLoggedIn(true);
        } catch (error) {
            console.log('Error guardando el estado de login:', error);
        }
    };

    // Función para manejar el logout
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user'); // Eliminar los datos del usuario
            setUser(null);
            setIsLoggedIn(false);
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
