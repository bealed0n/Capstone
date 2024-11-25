import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

export default function PostulacionesScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("tattoo_artist");
  const [password, setPassword] = useState("");
  const [requisitos, setRequisitos] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos permisos para acceder a tu galería."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setRequisitos(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!username || !email || !password || !requisitos) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("role", role);
    formData.append("password", password);
    formData.append("requisitos", {
      uri: requisitos,
      type: "image/jpeg",
      name: "documento.jpg",
    } as any);

    try {
      const response = await fetch("http://192.168.100.87:3000/postulaciones", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Tu postulación ha sido enviada correctamente");
        navigation.goBack();
      } else {
        throw new Error(data.message || "Error al enviar la postulación");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al enviar tu postulación. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Postulación
        </Text>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            Nombre de usuario
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800"
            value={username}
            onChangeText={setUsername}
            placeholder="Ingresa tu nombre de usuario"
            placeholderTextColor="#999"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            Correo electrónico
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800"
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2">Rol</Text>
          <View className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={{ color: Platform.OS === "ios" ? "#000" : "#fff" }}
            >
              <Picker.Item label="Tatuador" value="tattoo_artist" />
              <Picker.Item label="Diseñador" value="Designer" />
            </Picker>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            Contraseña
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800"
            value={password}
            onChangeText={setPassword}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#999"
            secureTextEntry
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            Documento de identidad
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            className="border border-gray-300 dark:border-gray-700 rounded-md p-2 items-center justify-center bg-gray-100 dark:bg-gray-800"
          >
            <Text className="text-blue-500">Seleccionar imagen</Text>
          </TouchableOpacity>
          {requisitos && (
            <Image
              source={{ uri: requisitos }}
              className="w-full h-40 mt-2 rounded-md"
            />
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          className={`rounded-md p-3 ${
            isLoading ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          <Text className="text-white text-center font-bold">
            {isLoading ? "Enviando..." : "Enviar postulación"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
