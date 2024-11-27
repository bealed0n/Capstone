import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "../../components/useColorScheme";
import { Href, router } from "expo-router";
import { UserContext } from "../context/userContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { SERVER_URL } from "@/constants/constants";

export default function StudioManagment() {
  const colorScheme = useColorScheme();
  const { user } = useContext(UserContext);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [studioId, setStudioId] = useState<number | null>(null);
  const [memberStudios, setMemberStudios] = useState([]);
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  const checkUserStatus = async () => {
    try {
      const ownerResponse = await fetch(
        `${SERVER_URL}/tattoo-studios/is-owner/${user.id}`
      );
      const ownerData = await ownerResponse.json();

      setIsOwner(ownerData.isOwner);

      if (ownerData.isOwner && ownerData.studios.length > 0) {
        setStudioId(ownerData.studios[0].id);
      } else {
        const memberResponse = await fetch(
          `${SERVER_URL}/tattoo-studios/is-member/${user.id}`
        );
        const memberData = await memberResponse.json();

        setIsMember(memberData.isMember);

        if (memberData.isMember && memberData.studios.length > 0) {
          setMemberStudios(memberData.studios);
          console.log(memberData.studios);
          console.log(memberData.studios[0].studio_id);

          setStudioId(memberData.studios[0].studio_id);
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
    }
  };

  return (
    <View className="flex-1 p-4">
      <View className="flex-1 justify-center items-center">
        {isOwner ? (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: `/tattoo-studio/studio-owner-view`,
                params: { studioId },
              })
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
              router.push({
                pathname: `/tattoo-studio/studio-member-view`,
                params: { studioId },
              })
            }
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-4"
          >
            <View className="items-center bg-transparent">
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
