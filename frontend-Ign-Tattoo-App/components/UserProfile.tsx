import React, { useContext } from "react";
import { TouchableOpacity, Image } from "react-native";
import { View, Text } from "./Themed"; // Asegúrate de que este componente esté bien configurado
import { useNavigation } from "@react-navigation/native";
import { Href, router } from "expo-router";
import EditScreenInfo from "./EditScreenInfo";
import { UserContext } from "../app/context/userContext";

const serverUrl = "http://192.168.100.87:3000";

export default function UserProfile() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const photo = require("../assets/images/user.png");

  return (
    <View>
      <View className="flex-row items-center ml-5 mt-4">
        <Image
          source={
            user?.profile_pic
              ? { uri: `${serverUrl}${user.profile_pic}` }
              : photo
          }
          className="w-20 h-20 rounded-full"
        />
        <View className="ml-4">
          <Text className="text-2xl font-bold">
            {user?.name ?? "No encontrado"}
          </Text>
          <Text className="text-sm text-gray-500">
            @{user?.username ?? "No encontrado"}
          </Text>
        </View>
      </View>

      <View className="mb-1">
        <Text className="font-bold text-xl text-center mb-4">Dashboard</Text>

        <Text className="font-bold text-lg text-center">Tattoos</Text>

        <View className="flex-row justify-center mt-2">
          <TouchableOpacity
            className="flex-1 mx-5"
            onPress={() => {
              router.push("/management/calendar" as Href);
            }}
          >
            <Text className="text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md">
              Calendar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 mx-5"
            onPress={() => {
              router.push("/management/apointmentList" as Href);
            }}
          >
            <Text className="text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md">
              Appointments
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="font-bold text-lg text-center mt-3">Designs</Text>

        <View className="flex-row justify-center mt-2">
          <TouchableOpacity
            className="flex-1 mx-5"
            onPress={() => {
              router.push("/designer/userRequested" as Href);
            }}
          >
            <Text className="text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md">
              Requested designs
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className=" mt-4 mb-2 h-0.5 border-t-0 bg-neutral-200 dark:bg-white/10" />
      <View>
        <Text className="font-bold text-center text-lg">Mis tatuajes</Text>
        <EditScreenInfo path="/screens/UserProfile.tsx" />
      </View>
    </View>
  );
}
