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
            name="apointmentList"
            options={{
              title: "Appointments",
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
            name="availableDates"
            options={{
              title: "Available Dates",
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
            name="calendar"
            options={{
              title: "Calendar",
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
            name="dateRequest"
            options={{
              title: "Request Date",
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
              title: "Available Designs",
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
            name="designerProjects"
            options={{
              title: "My projects",
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
            name="requestDesigns"
            options={{
              title: "My Requests",
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
