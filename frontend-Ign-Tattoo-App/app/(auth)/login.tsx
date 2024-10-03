import React, { useState } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';
import { View, Text } from "@/components/Themed"
import { useRouter, Link } from 'expo-router';
import 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('1234');
    const [error, setError] = useState('');
    const router = useRouter(); // Para redirigir

    const handleLogin = async () => {
        try {
            const response = await fetch('http://192.168.100.87:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.success) {
                // Redirigir a la página principal de tabs después del login exitoso
                router.replace('/(tabs)');
            } else {
                setError(data.message); // Mostrar error si las credenciales son incorrectas
            }
        } catch (error) {
            setError('Error en la conexión con el servidor');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                className='dark:text-white'
                placeholder="Email"
                value={email}
                onChangeText={setEmail}

                style={styles.input}
            />
            <TextInput
                className='dark:text-white'
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
});
