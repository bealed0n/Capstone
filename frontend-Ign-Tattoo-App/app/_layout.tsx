import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useContext, useEffect } from 'react';
import 'react-native-reanimated';
import { UserProvider } from '@/app/context/userContext';
import { useColorScheme } from '@/components/useColorScheme';
import { UserContext } from '@/app/context/userContext';
import { use } from 'i18next';

export {
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Prevent rendering until fonts are loaded.
  }

  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, loading } = useContext(UserContext);

  useEffect(() => {
    console.log('isLoggedIn ha cambiado', isLoggedIn);
  }, [isLoggedIn]);

  // Esperar a que la información de loading esté lista
  if (loading) {
    return null; // Evita navegar antes de que se complete la carga de datos.
  }

  // Verificar el estado de "isLoggedIn" y mostrar la vista correcta
  console.log('Estado actual de isLoggedIn:', isLoggedIn);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Navegación condicional según el estado de autenticación */}
        {isLoggedIn ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)/login" />
        )}
      </Stack>
    </ThemeProvider>
  );
}
