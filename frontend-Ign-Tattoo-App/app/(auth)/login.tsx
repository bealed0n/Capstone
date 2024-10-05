import React, { useContext, useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { View, Text } from "@/components/Themed"
import { useRouter } from 'expo-router';
import 'react-native-reanimated';
import { UserContext } from '@/app/context/userContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useContext(UserContext);  // Usa la función login del contexto

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
                login(data.user);  // Almacenar el usuario y cambiar el estado a logeado
                router.replace('/(tabs)');  // Redirigir a la pantalla de tabs
            } else {
                setError(data.message);  // Manejo de error
            }
        } catch (error) {
            setError('Error en la conexión con el servidor');
        }
    };

    return (
        <View className="flex-1 justify-center p-5">
            <View className='flex-row'>
                <Text className="text-xl">Welcome to </Text>
                <Text className="font-bold text-xl">IGN Tattoo</Text>
            </View>
            <Text className="mt-4">Email Adress</Text>
            <TextInput
                className="dark:text-white my-2 border border-gray-500 p-2 rounded"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
            />
            <Text className="mt-2">Password</Text>
            <TextInput
                className="dark:text-white my-2 border border-gray-500 p-2 rounded "
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity
                className="mt-1"
            >
                <Text className='text-right text-neutral-500'>Forgot your password?</Text>
            </TouchableOpacity>

            {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

            <TouchableOpacity
                className='mt-4'
                onPress={handleLogin}>
                <Text className='text-lg text-neutral-100 p-2 bg-neutral-800 text-center dark:bg-neutral-50 dark:text-neutral-700 font-bold rounded-md'>
                    Log In
                </Text>
            </TouchableOpacity>
            <View className="flex-row mt-4 justify-center mr-4">
                <Text>New to IGN Tattoo  </Text>

                <TouchableOpacity className=''
                    onPress={() => router.push('/(auth)/register')} >
                    <Text className='font-bold dark:text-white'>
                        Sign up
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
