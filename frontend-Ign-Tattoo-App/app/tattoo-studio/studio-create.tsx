import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { UserContext } from "../context/userContext";
import { router, useNavigation } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SERVER_URL } from "@/constants/constants";

export default function StudioCreate() {
  const { user } = useContext(UserContext);
  const owner_id = user?.id;
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState("");

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
    // Validar campos
    if (!name || !address || !description || !Image) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const formData = new FormData();
    formData.append("owner_id", owner_id);
    formData.append("name", name);
    formData.append("address", address);
    formData.append("description", description);
    if (imageUri) {
      const image = {
        uri: imageUri,
        name: "post-image.jpg",
        type: "image/jpeg",
      } as any;

      formData.append("image", image); // Adjuntar la imagen como un archivo
    }

    try {
      const response = await fetch(`${SERVER_URL}/tattoo-studios`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 201) {
        // Estudio creado correctamente
        alert("Estudio creado exitosamente");
        router.push("/(tabs)");
      } else {
        setError(data.error || "Error al crear el estudio.");
      }
    } catch (err) {
      console.error("Error al crear el estudio:", err);
      setError("Error de red. Intenta nuevamente.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
      <Text className="text-2xl font-bold text-center mb-6 dark:text-white">
        Crear Estudio de Tatuajes
      </Text>

      {error ? (
        <Text className="text-red-500 text-center mb-4">{error}</Text>
      ) : null}

      <TextInput
        className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-4 rounded-xl mb-4 shadow"
        placeholder="Nombre del Estudio"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-4 rounded-xl mb-4 shadow"
        placeholder="Dirección"
        placeholderTextColor="#888"
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-4 rounded-xl mb-4 shadow"
        placeholder="Descripción"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: undefined, aspectRatio: 1 }} // Relación de aspecto 1:1 para la imagen
          className="mb-4 rounded"
        />
      ) : (
        <TouchableOpacity
          className="bg-blue-500 dark:bg-blue-600 rounded-xl p-4 mb-4"
          onPress={pickImage}
        >
          <Text className="text-white font-bold text-lg text-center">
            Seleccionar Imagen
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-green-500 dark:bg-green-600 rounded-xl p-4 mb-4"
      >
        <Text className="text-white font-bold text-lg text-center">
          Crear Estudio
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
