import React, { useContext } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, Href, router, Link } from "expo-router";
import { Pressable } from "react-native";
import Colors from "../../constants/Colors";
import { useColorScheme } from "../../components/useColorScheme";
import { useClientOnlyValue } from "../../components/useClientOnlyValue";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { UserContext } from "../context/userContext";
import { MaterialIcons } from "@expo/vector-icons";

// function TabBarIcon(props: {
//   name: React.ComponentProps<typeof FontAwesome>["name"];
//   color: string;
// }) {
//   return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
// }

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
          headerRight: () =>
            user &&
            (user.role === "tattoo_artist" || user.role === "Designer") ? (
              <Link href="/createPost" asChild>
                <Pressable onPress={() => router.push("/createPost" as Href)}>
                  {({ pressed }) => (
                    <FontAwesome5
                      name="plus"
                      size={22}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ) : null,
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
          title: "Profile",
          tabBarActiveTintColor: activeColor,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="user"
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

      <Tabs.Screen
        name="[id]"
        options={{ title: "User Profile", href: null }}
      />
    </Tabs>
  );
}
