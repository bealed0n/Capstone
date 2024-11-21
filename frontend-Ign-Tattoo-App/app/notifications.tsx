// app/notifications.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Notifications() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900 p-4">
      <Text className="text-xl font-bold dark:text-white">Notificaciones</Text>
      <Text className="text-gray-500 dark:text-gray-400 mt-2">
        Aquí aparecerán tus notificaciones.
      </Text>
      <Button title="Cerrar" onPress={() => navigation.goBack()} />
    </View>
  );
}
