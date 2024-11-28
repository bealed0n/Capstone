import React, { useContext, useEffect, useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  BackHandler,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { View, Text } from "../../components/Themed";
import { useRouter, useSegments } from "expo-router";
import { UserContext } from "../context/userContext";
import { Feather } from "@expo/vector-icons";
import { SERVER_URL } from "@/constants/constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalVisible, setModalVisible] = useState(false); // Estado para el Modal
  const router = useRouter();
  const segments = useSegments();
  const { login, isLoggedIn } = useContext(UserContext);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.user);
        router.replace("/(tabs)");
      } else {
        if (data.message.includes("verifica tu correo")) {
          setModalVisible(true); // Mostrar Modal si el correo no está verificado
        }
        setError(data.message); // Mostrar el mensaje de error
      }
    } catch (error) {
      setError("Error en la conexión con el servidor");
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (!isLoggedIn) {
        if (segments[0] === "(auth)" && segments[1] === "login") {
          BackHandler.exitApp();
        }
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isLoggedIn, segments]);

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center p-5 bg-white dark:bg-neutral-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View className="items-center pb-7 dark:bg-neutral-900">
        <Feather name="droplet" size={200} color={iconColor} />
      </View>

      <View className="flex-row dark:bg-neutral-900">
        <Text className="text-xl">Bienvenido a </Text>
        <Text className="font-bold text-xl">IGN Tattoo</Text>
      </View>
      <Text className="mt-4">Correo</Text>
      <TextInput
        className="dark:text-white my-2 border border-gray-500 p-2 rounded"
        placeholder="you@example.com"
        placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
        value={email}
        onChangeText={setEmail}
      />
      <Text className="mt-2">Contraseña</Text>
      <TextInput
        className="my-2 border border-gray-500 p-2 rounded text-black dark:text-white"
        placeholder="Ingrese su contraseña"
        placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        onPress={() => router.push("/(auth)/forgot-password")}
        className="mt-1"
      >
        <Text className="text-right text-neutral-500">
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

      <TouchableOpacity
        className="mt-4 dark:bg-neutral-900"
        onPress={handleLogin}
      >
        <Text className="text-lg text-neutral-100 p-2 bg-neutral-800 text-center dark:bg-neutral-50 dark:text-neutral-700 font-bold rounded-md">
          Log In
        </Text>
      </TouchableOpacity>
      <View className="flex-row mt-4 justify-center mr-4 dark:bg-neutral-900">
        <Text>¿Nuevo en IGN Tattoo? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text className="font-bold dark:text-white">Registrate</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row mt-4 justify-center mr-4 dark:bg-neutral-900">
        <Text>¿Eres tatuador o diseñador?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/postulacion")}>
          <Text className="font-bold dark:text-white ml-2">
            Envia tu solicitud!
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para mensaje de alerta */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-3/4 bg-white p-5 rounded-lg shadow-lg dark:bg-neutral-800">
            <Text className="text-lg font-bold mb-4 text-red-600">
              Atención
            </Text>
            <Text className="text-base mb-4 text-neutral-700 dark:text-neutral-200">
              {error}
            </Text>
            <Pressable
              className="bg-blue-500 p-3 rounded-md"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center text-white font-bold">
                Entendido
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
