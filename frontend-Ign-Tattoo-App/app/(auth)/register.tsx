import { View, Text } from "@/components/Themed";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { UserContext } from "@/app/context/userContext";
import { Feather } from "@expo/vector-icons";
import { SERVER_URL } from "@/constants/constants";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter(); // Para redirigir
  const { login } = useContext(UserContext); // Usa la función login del contexto

  const checkPasswordStrength = (password: string) => {
    let strength = "";
    const regexes = [
      /[a-z]/, // Minúsculas
      /[A-Z]/, // Mayúsculas
      /[0-9]/, // Números
      /[^A-Za-z0-9]/, // Caracteres especiales
    ];
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

  const handleRegister = async () => {
    setError(""); // Limpiar errores previos
    setSuccess(""); // Limpiar mensajes previos
    try {
      const response = await fetch(`${SERVER_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message); // Mostrar mensaje de éxito
        setUsername("");
        setEmail("");
        setPassword("");
        // Redirigir a la pantalla de login después de unos segundos
        setTimeout(() => router.replace("/(auth)/login"), 1000);
      } else {
        setError(data.message || "Error al registrar usuario.");
      }
    } catch (error) {
      console.error(error);
      setError("Error en la conexión con el servidor.");
    }
  };

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black"; // 'light' is the default color scheme

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center p-5"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View className="flex-1 justify-center p-5">
        <View className="items-center pb-7">
          <Feather name="droplet" size={200} color={iconColor} />
        </View>
        <View className="flex-row justify-center">
          <Text className=" text-xl justify-center">Sign Up to </Text>
          <Text className="font-bold text-xl ">Ign Tattoo</Text>
        </View>
        <Text className="mb-1 mt-4">Usuario</Text>
        <TextInput
          className="dark:text-white border border-gray-500 p-2 rounded "
          placeholder="Username"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          value={username}
          onChangeText={setUsername}
        />
        <Text className="mb-1 mt-4">Email</Text>
        <TextInput
          className="dark:text-white  border border-gray-500 p-2 rounded"
          placeholder="you@example.com"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          value={email}
          onChangeText={setEmail}
        />
        <Text className="mt-4">Contraseña</Text>
        <TextInput
          className="dark:text-white border border-gray-500 p-2 rounded"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Contraseña"
          placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
          secureTextEntry
        />
        {passwordStrength === "weak" && (
          <Text className="text-red-500">Contraseña débil</Text>
        )}
        {passwordStrength === "medium" && (
          <Text className="text-orange-500">Contraseña media</Text>
        )}
        {passwordStrength === "strong" && (
          <Text className="text-green-500">Contraseña fuerte</Text>
        )}

        {/* Mostrar mensajes de error o éxito */}
        {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}
        {success ? (
          <Text className="text-green-500 mb-2">{success}</Text>
        ) : null}

        <TouchableOpacity className="mt-4" onPress={handleRegister}>
          <Text className="text-lg text-neutral-100 p-2 bg-neutral-800 text-center dark:bg-neutral-50 dark:text-neutral-700 font-bold rounded-md">
            Sign Up
          </Text>
        </TouchableOpacity>
        <View className="flex-row mt-4 justify-center mr-4 dark:bg-black">
          <Text>¿Tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="font-bold dark:text-white">Log In</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row mt-4 justify-center mr-4 dark:bg-black ">
          <Text>Eres Tatuador o Diseñador </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/postulacion")}>
            <Text className="font-bold dark:text-white">
              Envia tu solicitud aqui!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
