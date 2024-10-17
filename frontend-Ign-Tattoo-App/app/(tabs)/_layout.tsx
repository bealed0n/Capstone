import React, { useContext } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, Tabs, Href, Link } from 'expo-router';
import { Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { UserContext } from '../context/userContext';



// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'white' : 'black' // 'light' is the default color scheme
  const { user } = useContext(UserContext);




  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={iconColor} />,
          headerRight: () => (
            user && (user.role === 'tattoo_artist' || user.role === 'Designer') ? (
              <Link href="/createPost" asChild>
                <Pressable onPress={() => router.push('/createPost' as Href)}>
                  {({ pressed }) => (
                    <FontAwesome5
                      name="plus"
                      size={22}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ) : null
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <FontAwesome5 name="search" size={24} color={iconColor} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),

        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <FontAwesome5 name="envelope" size={24} color={iconColor} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: user && (user.role === 'tattoo_artist' || user.role === 'Designer') ? 'Profile' : 'Managment',
          tabBarIcon: user && (user.role === 'tattoo_artist' || user.role === 'Designer') ? ({ color }) =>
            <FontAwesome5 name="user" size={24} color={iconColor} /> : ({ color }) =>
            <FontAwesome5 name="cog" size={24} color={iconColor} />,

          // tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={24} color={iconColor} />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/profileConfig' as Href)}>
              {({ pressed }) => (
                <FontAwesome
                  name="bars"
                  size={25}
                  color={Colors[colorScheme ?? 'light'].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
