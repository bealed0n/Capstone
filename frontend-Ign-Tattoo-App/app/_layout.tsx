import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useContext, useEffect } from "react";
import "react-native-reanimated";
import { UserProvider } from "../app/context/userContext";
import { useColorScheme } from "../components/useColorScheme";
import { UserContext } from "../app/context/userContext";
import LoadingScreen from "../components/LoadingScreen"; // Nueva pantalla de carga

export { ErrorBoundary } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
    console.log("isLoggedIn ha cambiado", isLoggedIn);
  }, [isLoggedIn]);

  // Si está cargando los datos de usuario, mostramos la pantalla de carga
  if (loading) {
    return <LoadingScreen />;
  }

  // Verificar el estado de "isLoggedIn" y mostrar la vista correcta
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Navegación condicional según el estado de autenticación */}
        {isLoggedIn ? (
          <Stack.Screen name="(tabs)" /> // Mostrar tabs solo si está logueado
        ) : (
          <Stack.Screen name="(auth)/login" /> // Si no está logueado, mostrar login
        )}
      </Stack>
    </ThemeProvider>
  );
}
