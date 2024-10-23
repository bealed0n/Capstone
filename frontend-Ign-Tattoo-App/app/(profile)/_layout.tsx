import React from 'react';
import { Stack } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileLayout() {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTitle: 'User Profile',  // Puedes cambiar esto dinámicamente según el usuario si lo deseas
                headerLeft: () => {
                    return (
                        <Pressable onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back-ios" size={28} color={iconColor} />
                        </Pressable>
                    );
                },
            }}
        >
            <Stack.Screen
                name="[id]"
                options={{
                    title: '',  // Puedes dejar el título vacío para usar solo el icono de regreso
                }}
            />
        </Stack>
    );
}