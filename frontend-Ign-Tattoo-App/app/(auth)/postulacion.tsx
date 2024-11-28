import React, { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { View, Text } from "../../components/Themed";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "@/components/useColorScheme";
import { router } from "expo-router";
import { SERVER_URL } from "@/constants/constants";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostulacionesScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("tattoo_artist");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [requisitos, setRequisitos] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const pickImage = async (type: "requisitos" | "profile_pic") => {
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
      if (type === "requisitos") {
        setRequisitos(result.assets[0].uri);
      } else {
        setProfilePic(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !username ||
      !email ||
      !password ||
      !requisitos ||
      !name ||
      !profilePic
    ) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("role", role);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("requisitos", {
      uri: requisitos,
      type: "image/jpeg",
      name: "documento.jpg",
    } as any);
    formData.append("profile_pic", {
      uri: profilePic,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);

    try {
      const response = await fetch(`${SERVER_URL}/postulaciones`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Éxito",
          "Tu postulación ha sido enviada correctamente, obten tu respuesta en tu correo electrónico ingresado"
        );
        navigation.goBack();
      } else {
        throw new Error(data.message || "Error al enviar la postulación");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        (error as any).message ||
          "Hubo un problema al enviar tu postulación. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1 px-4 py-6">
          <Text className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Postulación
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              Nombre
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-700 rounded-md p-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800"
              value={name}
              onChangeText={setName}
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#999"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              Nombre de usuario
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-700 rounded-md p-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800"
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
              className="border border-gray-300 dark:border-gray-700 rounded-md p-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800"
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
                style={{ color: colorScheme === "dark" ? "white" : "black" }}
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
              className="border border-gray-300 dark:border-gray-700 rounded-md p-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800"
              value={password}
              onChangeText={setPassword}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              Foto de perfil
            </Text>
            <TouchableOpacity
              onPress={() => pickImage("profile_pic")}
              className="border border-gray-300 dark:border-gray-700 rounded-md p-3 items-center justify-center bg-gray-100 dark:bg-gray-800"
            >
              <Text className="text-blue-500">
                Seleccionar imagen de perfil
              </Text>
            </TouchableOpacity>
            {profilePic && (
              <Image
                source={{ uri: profilePic }}
                className="w-32 h-32 mt-2 rounded-full self-center"
              />
            )}
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              Documento de identidad
            </Text>
            <TouchableOpacity
              onPress={() => pickImage("requisitos")}
              className="border border-gray-300 dark:border-gray-700 rounded-md p-3 items-center justify-center bg-gray-100 dark:bg-gray-800"
            >
              <Text className="text-blue-500">Seleccionar documento</Text>
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
            className={`rounded-md p-4 ${
              isLoading ? "bg-gray-400" : "bg-blue-500"
            }`}
          >
            <Text className="text-white text-center font-bold">
              {isLoading ? "Enviando..." : "Enviar postulación"}
            </Text>
          </TouchableOpacity>

          <View className="mt-6 space-y-2">
            <View className="flex-row justify-center">
              <Text className="text-gray-600 dark:text-gray-400">
                ¿Tienes cuenta?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="font-bold text-blue-500">Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-center">
              <Text className="text-gray-600 dark:text-gray-400">
                ¿Nuevo en IGN Tattoo?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="font-bold text-blue-500">Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
