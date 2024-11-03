import React, { useContext } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, Href, Link, router } from "expo-router";
import { Button, Pressable } from "react-native";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../components/useColorScheme";
import { useClientOnlyValue } from "../../components/useClientOnlyValue";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { UserContext } from "../context/userContext";
import { MaterialIcons } from "@expo/vector-icons";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";
  const { user } = useContext(UserContext);
  const activeColor = colorScheme === "dark" ? "#faf7a5" : "#b09010";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="home"
              size={24}
              color={focused ? activeColor : iconColor}
            />
          ),
          tabBarActiveTintColor: activeColor,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="search"
              size={24}
              color={focused ? activeColor : iconColor}
            />
          ),
          tabBarActiveTintColor: activeColor,
        }}
      />
      <Tabs.Screen
        name="Inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="envelope"
              size={24}
              color={focused ? activeColor : iconColor}
            />
          ),
          tabBarActiveTintColor: activeColor,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:
            user && (user.role === "tattoo_artist" || user.role === "Designer")
              ? "Profile"
              : "Managment",
          tabBarActiveTintColor: activeColor,
          tabBarIcon:
            user && (user.role === "tattoo_artist" || user.role === "Designer")
              ? ({ color, focused }) => (
                  <FontAwesome5
                    name="user"
                    size={24}
                    color={focused ? activeColor : iconColor}
                  />
                )
              : ({ color, focused }) => (
                  <FontAwesome5
                    name="cog"
                    size={24}
                    color={focused ? activeColor : iconColor}
                  />
                ),

          // tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={24} color={iconColor} />,
          headerRight: () => (
            <Pressable onPress={() => router.push("/profileConfig" as Href)}>
              {({ pressed }) => (
                <FontAwesome
                  name="bars"
                  size={25}
                  color={Colors[colorScheme ?? "light"].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />

      {/* Ruta dinámica para el perfil de usuario */}
      <Tabs.Screen
        name="profile/[id]"
        options={({ navigation }) => ({
          title: "User Profile",
          tabBarButton: () => null, // Oculta el tab para esta ruta
          headerShown: true,
          headerLeft: () => {
            return (
              <Pressable className="ml-2" onPress={() => navigation.goBack()}>
                <MaterialIcons
                  name="arrow-back-ios"
                  size={28}
                  color={iconColor}
                />
              </Pressable>
            );
          },
        })}
      />
      <Tabs.Screen
        name="management/availableDates"
        options={({ navigation }) => ({
          title: "Available Dates",
          tabBarButton: () => null, // Oculta el tab para esta ruta
          headerShown: true,
          headerLeft: () => (
            <Pressable className="ml-2" onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                size={28}
                color={iconColor}
              />
            </Pressable>
          ),
        })}
      />
      <Tabs.Screen
        name="management/calendar"
        options={({ navigation }) => ({
          title: "Calendar",
          tabBarButton: () => null, // Oculta el tab para esta ruta
          headerShown: true,
          headerLeft: () => (
            <Pressable className="ml-2" onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                size={28}
                color={iconColor}
              />
            </Pressable>
          ),
        })}
      />
      <Tabs.Screen
        name="management/apointmentList"
        options={({ navigation }) => ({
          title: "Appointments",
          tabBarButton: () => null, // Oculta el tab para esta ruta
          headerShown: true,
          headerLeft: () => (
            <Pressable className="ml-2" onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                size={28}
                color={iconColor}
              />
            </Pressable>
          ),
        })}
      />
      <Tabs.Screen
        name="management/dateRequest"
        options={({ navigation }) => ({
          title: "Date request",
          tabBarButton: () => null, // Oculta el tab para esta ruta
          headerShown: true,
          headerLeft: () => (
            <Pressable className="ml-2" onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                size={28}
                color={iconColor}
              />
            </Pressable>
          ),
        })}
      />
    </Tabs>
  );
}
