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
import { View } from "../../components/Themed";
import { useNavigation } from "@react-navigation/native";

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
  const navigation = useNavigation();

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
          title: "Inicio",
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
          title: "Buscar",
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
          title: "Perfil",
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
            <View
              className="bg-transparent"
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              {user?.role === "tattoo_artist" && (
                <Pressable
                  onPress={() => navigation.navigate("notifications" as never)}
                  className="mr-5"
                >
                  {({ pressed }) => (
                    <MaterialIcons
                      name="notifications"
                      size={30}
                      color={iconColor}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              )}
              <Pressable
                onPress={() => router.push("/profileConfig" as Href)}
                className="mr-4"
              >
                {({ pressed }) => (
                  <FontAwesome
                    name="bars"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="user/[id]"
        options={{
          title: "Perfil",
          href: null,
        }}
      />

      <Tabs.Screen
        name="studio/[id]"
        options={{ title: "Perfil de estudio", href: null }}
      />
    </Tabs>
  );
}
