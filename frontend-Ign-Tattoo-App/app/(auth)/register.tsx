import { View, Text } from '@/components/Themed';
import { useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter(); // Para redirigir

    const handleRegister = async () => {
        try {
            const response = await fetch('http://192.168.100.87:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (data.success) {
                // Redirigir a la página principal de tabs después del login exitoso
                router.replace('/(tabs)');
            }
            else {
                setError(data.message); // Mostrar error
            }
        }
        catch (error) {
            setError('Error en la conexión con el servidor');
        }
    }

    return (
        <View className="flex-1 justify-center p-5">
            <View className='flex-row justify-center'>
                <Text className=" text-xl justify-center">Sign Up to </Text>
                <Text className="font-bold text-xl ">Ign Tattoo</Text>
            </View>
            <TextInput
                className="dark:text-white mt-4 border border-gray-500 p-2 rounded "
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                className="dark:text-white my-5 border border-gray-500 p-2 rounded"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                className="dark:text-white  border border-gray-500 p-2 rounded "
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity
                className="mt-1"
            >
            </TouchableOpacity>

            {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

            <TouchableOpacity
                className='mt-4'
                onPress={handleRegister}
            >
                <Text className='text-lg text-neutral-100 p-2 bg-neutral-800 text-center dark:bg-neutral-50 dark:text-neutral-700 font-bold rounded-md'>
                    Sign Up
                </Text>
            </TouchableOpacity>
        </View>
    );

}