import React from "react";
import { Stack } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { View } from "../../components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import {
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { useColorScheme } from "../../components/useColorScheme";
import { UserProvider } from "../context/userContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable } from "react-native";

export default function SettingsLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const iconColor = colorScheme === "dark" ? "white" : "black";

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
            },
            headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          }}
        >
          {/* Pantalla principal de configuraciones */}
          <Stack.Screen
            name="reviewsView"
            options={({ navigation }) => ({
              title: "Reviews",
              headerLeft: () => (
                <Pressable
                  style={{ marginLeft: 3, marginRight: 20 }}
                  onPress={() => navigation.goBack()}
                >
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={28}
                    color={iconColor}
                  />
                </Pressable>
              ),
            })}
          />
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}
