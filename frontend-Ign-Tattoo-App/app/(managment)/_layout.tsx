import React from 'react';
import { Stack } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ManagmentLayout() {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTitle: 'Management',  // Puedes cambiar esto dinámicamente según el usuario si lo deseas
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
                name="apointmentList"
                options={{
                    title: 'Appointments',  // Título para la pantalla de citas
                }}
            />
            <Stack.Screen
                name="calendar"
                options={{
                    title: 'Calendar',  // Título para la pantalla de calendario
                }}
            />
        </Stack>
    );
}