import React, { useContext, useEffect, useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  BackHandler,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { View, Text } from "../../components/Themed";
import { useRouter, useSegments } from "expo-router";
import { UserContext } from "../context/userContext";
import { Feather } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const segments = useSegments();
  const { login, isLoggedIn } = useContext(UserContext);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://192.168.100.87:3000/login", {
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
        setError(data.message);
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
        className="dark:text-white my-2 border border-gray-500 p-2 rounded"
        placeholder="Ingrese su contraseña"
        placeholderTextColor={colorScheme === "dark" ? "gray" : "gray"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity className="mt-1">
        <Text className="text-right text-neutral-500">
          Forgot your password?
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
    </KeyboardAvoidingView>
  );
}
