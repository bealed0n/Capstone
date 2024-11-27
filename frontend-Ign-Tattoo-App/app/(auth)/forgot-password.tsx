import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SERVER_URL } from "@/constants/constants";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor, ingresa tu correo electrónico.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", data.message, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-neutral-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center px-5">
          <Image
            source={require("../../assets/images/forgot-password.png")}
            className="w-52 h-52 mb-5"
          />
          <Text className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            ¿Olvidaste tu contraseña?
          </Text>
          <Text className="text-base text-gray-600 text-center mb-5 dark:text-gray-200">
            No te preocupes, te enviaremos un enlace para restablecerla.
          </Text>
          <TextInput
            className="w-full h-12 border border-gray-300 rounded-lg px-4 mb-5 bg-white text-base"
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor={useColorScheme() === "dark" ? "#666" : "#999"}
            autoCapitalize="none"
          />
          <TouchableOpacity
            className={`w-full h-12 rounded-lg justify-center items-center ${
              isLoading ? "bg-gray-400" : "bg-blue-500"
            }`}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text className="text-white text-lg font-bold">
              {isLoading ? "Enviando..." : "Restablecer contraseña"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} className="mt-5">
            <Text className="text-blue-500 text-base">
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
