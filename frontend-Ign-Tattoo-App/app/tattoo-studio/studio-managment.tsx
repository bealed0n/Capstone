import React, { useEffect, useState, useContext } from "react";

import { View, Text } from "../../components/Themed";
import { useColorScheme } from "../../components/useColorScheme";
import { Href, router, useNavigation } from "expo-router";
import { UserContext } from "../context/userContext";
import { Button, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function StudioManagment() {
  const SERVER_URL = "http://192.168.100.87:3000";
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  const checkUserStatus = async () => {
    try {
      // Verificar si el usuario es propietario
      const ownerResponse = await fetch(
        `${SERVER_URL}/tattoo-studios/is-owner/${user.id}`
      );
      const ownerData = await ownerResponse.json();
      setIsOwner(ownerData.isOwner);

      // Si no es propietario, verificar si es miembro
      if (!ownerData.isOwner) {
        const memberResponse = await fetch(
          `${SERVER_URL}/tattoo-studios/is-member/${user.id}`
        );
        const memberData = await memberResponse.json();
        setIsMember(memberData.isMember);
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
    }
  };

  const handleManageStudio = () => {
    router.push("/studio-owner-view");
    // Aquí iría la lógica para gestionar el estudio
  };

  const handleViewStudio = () => {
    console.log("Ver estudio");
    // Aquí iría la lógica para ver el estudio
  };

  const handleCreateStudio = () => {
    console.log("Crear un estudio");
    // Aquí iría la lógica para crear un nuevo estudio
  };

  return (
    <View className="flex-1  p-4">
      <View className="flex-1 justify-center items-center">
        {isOwner ? (
          <TouchableOpacity
            onPress={() =>
              router.push(`/tattoo-studio/studio-owner-view` as Href)
            }
            className="w-full max-w-sm bg-gray-200 dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4"
          >
            <View className="items-center bg-transparent">
              <FontAwesome5
                name="store"
                size={50}
                color={isDark ? "#ffffff" : "#000000"}
              />
              <Text className="text-2xl font-bold mt-4 dark:text-white">
                Gestionar mi Estudio
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                Administra tu estudio y artistas
              </Text>
            </View>
          </TouchableOpacity>
        ) : isMember ? (
          <TouchableOpacity
            onPress={() =>
              router.push(`/tattoo-studio/studio-member-view` as Href)
            }
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-4"
          >
            <View className="items-center bg-transparent ">
              <FontAwesome5
                name="user-circle"
                size={50}
                color={isDark ? "#ffffff" : "#000000"}
              />
              <Text className="text-2xl font-bold mt-4 dark:text-white">
                Ver mi Estudio
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                Revisa la información de tu estudio actual
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View className="w-full max-w-sm">
            <View className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
              <View className="items-center bg-transparent">
                <FontAwesome5
                  name="exclamation-circle"
                  size={50}
                  color={isDark ? "#ffffff" : "#000000"}
                />
                <Text className="text-xl font-bold mt-4 text-center dark:text-white">
                  No perteneces a ningún estudio
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                  Crea tu propio estudio o únete a uno existente
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push(`/tattoo-studio/studio-create` as Href)
              }
              className="bg-blue-500 rounded-xl shadow-lg p-4 active:bg-blue-600"
            >
              <View className="flex-row justify-center items-center space-x-2 bg-transparent">
                <FontAwesome5 name="plus-circle" size={24} color="white" />
                <Text className="text-white font-bold text-lg">
                  Crear un Estudio
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
