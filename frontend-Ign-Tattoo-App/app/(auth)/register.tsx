import React, { useState, useContext } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { UserContext } from "@/app/context/userContext";
import { Feather } from "@expo/vector-icons";
import { SERVER_URL } from "@/constants/constants";
import * as ImagePicker from "expo-image-picker";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { login } = useContext(UserContext);

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";

  const checkPasswordStrength = (password: string) => {
    let strength = "";
    const regexes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const passedTests = regexes.reduce(
      (acc, regex) => acc + Number(regex.test(password)),
      0
    );

    if (password.length >= 8 && passedTests >= 3) {
      strength = "strong";
    } else if (password.length >= 6 && passedTests >= 2) {
      strength = "medium";
    } else {
      strength = "weak";
    }

    setPasswordStrength(strength);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    checkPasswordStrength(text);
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!username || !email || !password || !name) {
      Alert.alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);

      if (profilePic) {
        const uriParts = profilePic.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("profile_pic", {
          uri: profilePic,
          name: `profile_pic.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await fetch(`${SERVER_URL}/register`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        setUsername("");
        setEmail("");
        setPassword("");
        setName("");
        setProfilePic(null);
        setTimeout(() => router.replace("/(auth)/login"), 1000);
      } else {
        setError(data.message || "Error al registrar usuario.");
      }
    } catch (error) {
      console.error(error);
      setError("Error en la conexión con el servidor.");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center p-5"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View className="flex-1 justify-center p-5">
        <View className="items-center pb-7">
          <Feather name="droplet" size={100} color={iconColor} />
        </View>
        <View className="flex-row justify-center mb-6">
          <Text className="text-xl dark:text-white">Registrate en </Text>
          <Text className="font-bold text-xl dark:text-white">IGN Tattoo</Text>
        </View>

        <TouchableOpacity
          onPress={handlePickImage}
          className="items-center mb-4"
        >
          {profilePic ? (
            <Image
              source={{ uri: profilePic }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center">
              <Feather name="camera" size={32} color="gray" />
            </View>
          )}
          <Text className="mt-2 text-blue-500">Subir foto de perfil</Text>
        </TouchableOpacity>

        <TextInput
          className="dark:text-white border border-gray-300 p-3 rounded-lg mb-4"
          placeholder="Nombre"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="dark:text-white border border-gray-300 p-3 rounded-lg mb-4"
          placeholder="Nombre de usuario"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          className="dark:text-white border border-gray-300 p-3 rounded-lg mb-4"
          placeholder="Correo electrónico"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          className="dark:text-white border border-gray-300 p-3 rounded-lg mb-2"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Contraseña"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          secureTextEntry
        />
        {passwordStrength && (
          <Text
            className={`mb-4 ${
              passwordStrength === "weak"
                ? "text-red-500"
                : passwordStrength === "medium"
                  ? "text-orange-500"
                  : "text-green-500"
            }`}
          >
            Contraseña{" "}
            {passwordStrength === "weak"
              ? "débil"
              : passwordStrength === "medium"
                ? "media"
                : "fuerte"}
          </Text>
        )}

        {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}
        {success ? (
          <Text className="text-green-500 mb-2">{success}</Text>
        ) : null}

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg mb-4 mt-2"
          onPress={handleRegister}
        >
          <Text className="text-white text-center font-bold">Registrarse</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="dark:text-white">¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="font-bold text-blue-500">Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row mt-4 justify-center mr-4 ">
          <Text className="dark:text-white">¿Eres tatuador o diseñador?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/postulacion")}>
            <Text className="font-bold dark:text-white ml-2 text-blue-500">
              Envia tu solicitud!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
