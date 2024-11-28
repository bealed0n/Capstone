import React, { useContext, useEffect, useState } from "react";
import {
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import { View, Text } from "./Themed";
import { useNavigation } from "@react-navigation/native";
import { Href, router } from "expo-router";
import { UserContext } from "../app/context/userContext";
import ClientReviews from "./clientReview";
import { SERVER_URL } from "@/constants/constants";

interface UserData {
  id: number;
  name: string;
  bio: string | null;
  username: string;
  profile_pic: string | null;
  role: string;
}

export default function UserProfile() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const photo = require("../assets/images/user.png");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/users/${user?.id}`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Crear un array de datos para el FlatList
  const data = [
    {
      key: "header",
      content: (
        <View className="flex-row items-center ml-5 mt-4">
          <Image
            source={
              userData?.profile_pic
                ? { uri: `${SERVER_URL}${userData.profile_pic}` }
                : photo
            }
            className="w-20 h-20 rounded-full"
          />
          <View className="ml-4">
            <Text className="text-2xl font-bold">
              {userData?.name ?? "No encontrado"}
            </Text>
            <Text className="text-sm text-gray-500">
              @{userData?.username ?? "No encontrado"}
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: "dashboard",
      content: (
        <View className="mb-1">
          <Text className="font-bold text-xl text-center mb-4">Dashboard</Text>

          <Text className="font-bold text-lg text-center">Tattoos</Text>

          <View className="flex-row justify-center mt-2">
            <TouchableOpacity
              className="flex-1 mx-5 bg-yellow-600 rounded-md"
              onPress={() => {
                router.push("/management/calendar" as Href);
              }}
            >
              <Text className="text-lg p-2 text-center font-semibold text-white">
                Calendario
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 mx-5 bg-yellow-600 rounded-md"
              onPress={() => {
                router.push("/management/apointmentList" as Href);
              }}
            >
              <Text className="text-lg p-2 text-center text-white font-semibold dark:text-neutral-50">
                Citas
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="font-bold text-lg text-center mt-3">Diseños</Text>

          <View className="flex-row justify-center mt-2">
            <TouchableOpacity
              className="flex-1 mx-5 bg-indigo-500 rounded-md"
              onPress={() => {
                router.push("/designer/userRequested" as Href);
              }}
            >
              <Text className="text-lg text-white font-semibold p-2 text-center dark:text-neutral-50 rounded-md">
                Diseños solicitados
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
    {
      key: "clientReviews",
      content: <ClientReviews onRefresh={onRefresh} />,
    },
  ];

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <View>{item.content}</View>}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyExtractor={(item) => item.key}
      contentContainerStyle={{ paddingBottom: 20 }} // Para agregar un poco de espacio en la parte inferior
    />
  );
}
