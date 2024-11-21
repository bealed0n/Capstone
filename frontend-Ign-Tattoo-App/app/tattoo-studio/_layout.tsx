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

export default function ManageStudioLayout() {
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
            name="studio-managment"
            options={{
              title: "Gestion de estudio",
              headerLeft: () => (
                <Pressable className="pr-2" onPress={() => navigation.goBack()}>
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
            name="studio-owner-view"
            options={{
              title: "Gestion de estudio",
              headerLeft: () => (
                <Pressable className="pr-2" onPress={() => navigation.goBack()}>
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
            name="studio-member-view"
            options={{
              title: "Mi estudio",
              headerLeft: () => (
                <Pressable className="pr-2" onPress={() => navigation.goBack()}>
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
            name="studio-create"
            options={{
              title: "Creacion de estudio",
              headerLeft: () => (
                <Pressable className="pr-2" onPress={() => navigation.goBack()}>
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
            name="studio-edit/[id]"
            options={{
              title: "Editar estudio",
              headerLeft: () => (
                <Pressable className="pr-2" onPress={() => navigation.goBack()}>
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
            name="studio-admin"
            options={{
              title: "Administracion de miembros",
              headerLeft: () => (
                <Pressable className="pr-2" onPress={() => navigation.goBack()}>
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
