import React from "react";
import { Stack } from "expo-router";
import {
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { useColorScheme } from "../../components/useColorScheme";
import { UserProvider } from "../context/userContext";
import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ManagementLayout() {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";
  const navigation = useNavigation();

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
          <Stack.Screen
            name="designerProjects"
            options={{
              title: "Mis proyectos",
              headerLeft: () => (
                <Pressable className="ml-2" onPress={() => navigation.goBack()}>
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={28}
                    color={iconColor}
                  />
                </Pressable>
              ),
            }}
          />
          <Stack.Screen
            name="availableDesigns"
            options={{
              title: "Diseños disponibles",
              headerLeft: () => (
                <Pressable className="ml-2" onPress={() => navigation.goBack()}>
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={28}
                    color={iconColor}
                  />
                </Pressable>
              ),
            }}
          />
          <Stack.Screen
            name="requestedDesigns"
            options={{
              title: "Diseños solicitados",
              headerLeft: () => (
                <Pressable className="ml-2" onPress={() => navigation.goBack()}>
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={28}
                    color={iconColor}
                  />
                </Pressable>
              ),
            }}
          />
          <Stack.Screen
            name="userRequested"
            options={{
              title: "Diseños solicitados",
              headerLeft: () => (
                <Pressable className="ml-2" onPress={() => navigation.goBack()}>
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={28}
                    color={iconColor}
                  />
                </Pressable>
              ),
            }}
          />
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}
