import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import { UserProvider } from '@/app/context/userContext';

export default function SettingsLayout() {
    const colorScheme = useColorScheme();

    return (
        <UserProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack
                    screenOptions={{
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                        },
                        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
                    }}
                >
                    {/* Pantalla principal de configuraciones */}
                    <Stack.Screen
                        name="profileConfig"
                        options={{ title: 'Settings' }} // Título para la pantalla principal
                    />
                </Stack>
            </ThemeProvider>
        </UserProvider>
    );
}
