import React, { useState, useContext, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { View, Text } from "../../components/Themed";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../context/userContext";
import { useRoute, RouteProp } from "@react-navigation/native";
import { SERVER_URL } from "@/constants/constants";

interface RouteParams {
  date: string;
  time: string;
  tattoo_artist_id: string;
}

export default function DateRequest() {
  const { user } = useContext(UserContext);
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null); // Para almacenar la URI de la imagen seleccionada
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener los parámetros de búsqueda directamente desde el objeto router
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { date, time, tattoo_artist_id } = route.params;

  useEffect(() => {
    console.log("Fecha y hora recibidas:", date, time);
  }, [date, time]);

  // Función para seleccionar imagen desde la galería
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permiso requerido",
        "Se requiere permiso para acceder a tu galería"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri); // Guardar la URI de la imagen seleccionada
    }
  };

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert("Error", "La descripción no puede estar vacía");
      return;
    }

    setIsSubmitting(true); // Iniciar el estado de envío
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("tattoo_artist_id", tattoo_artist_id);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("description", description);

      if (imageUri) {
        const uriParts = imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("reference_image", {
          uri: imageUri,
          name: `reference-image.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await fetch(`${SERVER_URL}/appointments`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("Respuesta del servidor:", jsonResponse);
        Alert.alert("Cita creada", "Tu cita ha sido creada con éxito");
        router.replace("/(tabs)");
      } else {
        const errorResponse = await response.json();
        console.error("Error en la respuesta del servidor:", errorResponse);
        Alert.alert("Error", "No se pudo crear la cita");
      }
    } catch (error) {
      console.error("Error creando la cita:", error);
      Alert.alert("Error", "Hubo un problema al conectarse al servidor");
    } finally {
      setIsSubmitting(false); // Finalizar el estado de envío
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center p-5"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90} // Ajusta según sea necesario
    >
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold mb-4">Request Appointment</Text>

        {/* Muestra la imagen seleccionada si existe */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: undefined, aspectRatio: 4 / 5 }} // Relación de aspecto 4:5 para la imagen
            className="mb-4 rounded"
          />
        ) : (
          <TouchableOpacity
            className="bg-gray-200 p-3 rounded mb-4 w-full"
            onPress={pickImage}
          >
            <Text className="text-center text-gray-500">
              Select reference image
            </Text>
          </TouchableOpacity>
        )}

        <TextInput
          className="border border-gray-300 rounded p-2 w-full mb-4 dark:text-white"
          placeholder="Escribe una descripción"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded w-full"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center">Solicitar Cita</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
