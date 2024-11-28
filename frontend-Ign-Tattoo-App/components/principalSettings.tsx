import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter, Href } from "expo-router";
import { UserContext } from "../app/context/userContext";
import { useColorScheme } from "./useColorScheme";
import { useNavigation } from "@react-navigation/native";

interface PrincipalSettingsProps {
  path: string;
}

export default function PrincipalSettings({ path }: PrincipalSettingsProps) {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";
  const { logout } = useContext(UserContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "(auth)/login" as never }],
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <Text className="text-neutral-600 dark:text-neutral-400 ml-4 mt-2 mb-2">
        Configuracion
      </Text>

      {/* Opción: Edit Profile */}
      <TouchableOpacity
        className="flex-row items-center w-full p-4 border-b border-gray-300 dark:border-gray-700"
        onPress={() => router.push(`/editProfile/edit` as Href)}
      >
        <View className="flex-row items-center flex-1">
          <FontAwesome name="pencil" size={22} color={iconColor} />
          <Text className="text-base dark:text-white ml-4">Editar Perfil</Text>
        </View>
      </TouchableOpacity>

      {/* Opción: Estudios de Tatuaje */}
      {user?.role === "tattoo_artist" && (
        <TouchableOpacity
          className="flex-row items-center w-full p-4 border-b border-gray-300 dark:border-gray-700"
          onPress={() => router.push(`/tattoo-studio/studio-managment` as Href)}
        >
          <View className="flex-row items-center flex-1">
            <FontAwesome name="building" size={22} color={iconColor} />
            <Text className="text-base dark:text-white ml-4">
              Estudios de Tatuaje
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Opción: Cerrar Sesión */}
      <TouchableOpacity
        className="flex-row items-center w-full p-4 border-b border-gray-300 dark:border-gray-700"
        onPress={handleLogout}
      >
        <View className="flex-row items-center flex-1">
          <FontAwesome name="sign-out" size={22} color={iconColor} />
          <Text className="text-base dark:text-white ml-4">Cerrar Sesión</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
