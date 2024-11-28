import { useState, useContext } from "react";
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
import { View, Text } from "../components/Themed";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "./context/userContext";
import { SERVER_URL } from "@/constants/constants";

export default function CreatePost() {
  const { user } = useContext(UserContext);
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null); // Para almacenar la URI de la imagen seleccionada
  const router = useRouter();
  const colorScheme = useColorScheme();

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

  //   // Función para convertir la imagen a Blob
  //   const createBlobFromUri = async (uri: string) => {
  //     const response = await fetch(uri);
  //     const blob = await response.blob();
  //     console.log("Blob creado:", blob); // Agregar un log
  //     return blob;
  //   };

  const handleSubmit = async () => {
    if (!content) {
      Alert.alert("Error", "El contenido del post no puede estar vacío");
      return;
    }

    // Agrega este log para verificar que el `user` y su `id` estén disponibles
    console.log("Usuario cargado desde el contexto:", user);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("user_id", user.id); // Aquí estás enviando el userId

      if (imageUri) {
        const image = {
          uri: imageUri,
          name: "post-image.jpg",
          type: "image/jpeg",
        } as any;

        formData.append("image", image); // Adjuntar la imagen como un archivo
      }

      const response = await fetch(`${SERVER_URL}/posts`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("Respuesta del servidor:", jsonResponse);
        Alert.alert("Post creado", "Tu post ha sido creado con éxito");
        router.replace("/(tabs)");
      } else {
        const errorResponse = await response.json();
        console.error("Error en la respuesta del servidor:", errorResponse);
        Alert.alert("Error", "No se pudo crear el post");
      }
    } catch (error) {
      console.error("Error creando el post:", error);
      Alert.alert("Error", "Hubo un problema al conectarse al servidor");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center p-5"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90} // Ajusta según sea necesario
    >
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold mb-4 ">Subir publicación</Text>

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
            <Text className="text-center text-gray-500">Seleccione imagen</Text>
          </TouchableOpacity>
        )}

        <TextInput
          className="border border-gray-300 rounded p-2 w-full mb-4 dark:text-white"
          placeholder="Escribe tu post aquí..."
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          value={content}
          onChangeText={setContent}
          multiline
        />

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded w-full"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center">Publicar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
