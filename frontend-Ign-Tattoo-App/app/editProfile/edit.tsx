import React, { useState, useEffect, useContext } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { Text, View } from "../../components/Themed";
import { UserContext } from "../context/userContext";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { SERVER_URL } from "@/constants/constants";

interface UserProfile {
  id: number;
  username: string;
  name: string;
  profile_pic: string | null;
}

export default function ProfileEdit() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { user, updateUser } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      requestMediaLibraryPermissions();
    }
  }, [user]);

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/users/${user?.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setProfile(data);
      setUsername(data.username);
      setName(data.name);
      if (data.profile_pic) {
        setImageUri(`${SERVER_URL}${data.profile_pic}`);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadProfilePicture = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profile_pic", {
        uri,
        type: "image/jpeg",
        name: "profile-picture.jpg",
      } as any);

      const response = await fetch(
        `${SERVER_URL}/users/${user?.id}/profile-pic`,
        {
          method: "PUT",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }

      const updatedUser = await response.json();

      setProfile((prevProfile) => ({ ...prevProfile, ...updatedUser }));
      updateUser(updatedUser);

      Alert.alert("Éxito", "Imagen de perfil actualizada correctamente");
    } catch (error) {
      console.error("Error subiendo la imagen de perfil:", error);
      Alert.alert("Error", "No se pudo subir la imagen de perfil");
    } finally {
      setLoading(false);
    }
  };

  const updateUsername = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/users/${user?.id}/username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      const updatedUser = await response.json();

      // Actualizar el perfil local
      setProfile((prevProfile) => ({ ...prevProfile, ...updatedUser }));

      // Actualizar el contexto de usuario
      updateUser(updatedUser);

      Alert.alert("Éxito", "Nombre de usuario actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando el nombre de usuario:", error);
      Alert.alert("Error", "No se pudo actualizar el nombre de usuario");
    } finally {
      setLoading(false);
    }
  };

  const updateName = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/users/${user?.id}/name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update name");
      }

      const updatedUser = await response.json();
      setProfile((prevProfile) => ({ ...prevProfile, ...updatedUser }));
      Alert.alert("Success", "Name updated successfully");
    } catch (error) {
      console.error("Error updating name:", error);
      Alert.alert("Error", "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-4">Editar perfil</Text>

          <TouchableOpacity onPress={pickImage} className="items-center mb-6">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-32 h-32 rounded-full mb-2"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mb-2">
                <Camera size={40} color="gray" />
              </View>
            )}
            <Text className="text-blue-500">Cmabiar imagen de perfil</Text>
          </TouchableOpacity>

          <View className="mb-4">
            <Text className="text-lg mb-2">Usuario</Text>
            <TextInput
              className="bg-gray-300 dark:bg-gray-800 p-2 rounded-md dark:text-white"
              value={username}
              onChangeText={setUsername}
              placeholder="Ingrese usuario"
            />
            <TouchableOpacity
              className="bg-blue-500 p-2 rounded-md mt-2"
              onPress={updateUsername}
              disabled={loading}
            >
              <Text className="text-white text-center">
                {loading ? "Actualizando..." : "Actualizar usuario"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-lg mb-2">Nombre</Text>
            <TextInput
              className="bg-gray-300 dark:bg-gray-800 p-2 rounded-md dark:text-white"
              value={name}
              onChangeText={setName}
              placeholder="Ingrese nombre"
            />
            <TouchableOpacity
              className="bg-blue-500 p-2 rounded-md mt-2"
              onPress={updateName}
              disabled={loading}
            >
              <Text className="text-white text-center">
                {loading ? "Actualizando..." : "Actualizar nombre"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
