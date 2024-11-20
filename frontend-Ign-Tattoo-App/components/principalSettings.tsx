import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorScheme } from "./useColorScheme";
import { UserContext } from "../app/context/userContext";
import { Href, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function PrincipalSettings({ path }: { path: string }) {
  const { logout } = useContext(UserContext);
  const router = useRouter();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "(auth)/login" as never }],
    });
  };

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";
  const { user } = useContext(UserContext);

  return (
    <View className="flex-1">
      <Text className="text-neutral-600 ml-4 mt-2 mb-2">Sesión</Text>

      {/* Opción: Edit Profile */}
      <TouchableOpacity
        className="flex-row items-center w-full p-4 border-b border-gray-300"
        onPress={() => router.push(`/editProfile/edit` as Href)}
      >
        <View className="flex-row items-center">
          <FontAwesome name="pencil" size={22} color={iconColor} />
          <Text className="text-base dark:text-white ml-4">Editar Perfil</Text>
        </View>
      </TouchableOpacity>

      {/* Opción: Estudios de Tatuaje */}
      {user?.role === "tattoo_artist" && (
        <TouchableOpacity
          className="flex-row items-center w-full p-4 border-b border-gray-300"
          onPress={() => console.log("Estudios de Tatuaje")}
        >
          <View className="flex-row items-center">
            <FontAwesome name="building" size={22} color={iconColor} />
            <Text className="text-base dark:text-white ml-4">
              Estudios de Tatuaje
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Opción: Log Out */}
      <TouchableOpacity
        className="flex-row items-center w-full p-4 border-b border-gray-300"
        onPress={handleLogout}
      >
        <View className="flex-row items-center">
          <FontAwesome name="sign-out" size={22} color={iconColor} />
          <Text className="text-base dark:text-white ml-4">Cerrar Sesión</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
