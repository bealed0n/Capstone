import { View, Text } from '../components/Themed';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { UserContext } from '@/app/context/userContext';
import React, { useContext } from 'react';
import { useRouter } from 'expo-router';




export default function principalSettings({ path }: { path: string }) {

    const { logout } = useContext(UserContext);
    const router = useRouter();
    const handleLogout = async () => {
        await logout(); // Llama a la función logout al presionar el botón
        router.push('/(auth)/login'); // Redirige a la pantalla de autenticación
    };

    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black'
    return (
        <View className='flex-1 flex-col '>

            <Text className='text-neutral-600 ml-4 mt-2'>Sesion</Text>

            <TouchableOpacity
                className='flex-row justify-start items-center w-full p-2'
                onPress={handleLogout} // Llama a handleLogout al presionar el botón
            >
                <FontAwesome name="sign-out" size={22} color={iconColor} className='mr-2' />
                <Text className='text-base dark:text-white ml-2'>Log out</Text>
            </TouchableOpacity>

        </View>
    );
}