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
  useColorScheme,
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
  bio: string | null;
}

export default function ProfileEdit() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { user, updateUser } = useContext(UserContext);

  // Mover useColorScheme al nivel superior
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      requestMediaLibraryPermissions();
    }
  }, [user]);

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Lo sentimos, necesitamos permisos para acceder a tus fotos."
      );
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
      setBio(data.bio); // Asegúrate de establecer la bio
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
      console.log("Uploading image from URI:", uri);

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
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload error response:", errorData);
        throw new Error(
          "Failed to upload profile picture: " + errorData.message
        );
      }

      const updatedUser = await response.json();
      console.log("Profile picture uploaded successfully:", updatedUser);
    } catch (error) {
      console.error("Error subiendo la imagen de perfil:", error);
      Alert.alert(
        "Error",
        "No se pudo subir la imagen de perfil: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
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
        const data = await response.json();
        if (data.message === "El nombre de usuario ya está registrado.") {
          Alert.alert(
            "Error",
            "El nombre de usuario ya está registrado. Intenta con otro."
          );
        } else {
          throw new Error("No se pudo actualizar el nombre de usuario");
        }
      } else {
        const updatedUser = await response.json();

        // Combinar el usuario previo con los datos actualizados
        setProfile((prevProfile) => ({ ...prevProfile, ...updatedUser }));
        updateUser((prevUser: any) => ({ ...prevUser, ...updatedUser }));

        Alert.alert("Éxito", "Nombre de usuario actualizado correctamente");
      }
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
      Alert.alert("Éxito", "Nombre actualizado correctamente");
    } catch (error) {
      console.error("Error updating name:", error);
      Alert.alert("Error", "No se pudo actualizar el nombre");
    } finally {
      setLoading(false);
    }
  };

  const updateBio = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/users/${user?.id}/bio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bio");
      }

      const updatedUser = await response.json();
      setProfile((prevProfile) => ({ ...prevProfile, ...updatedUser }));
      Alert.alert("Éxito", "Bio actualizada correctamente");
    } catch (error) {
      console.error("Error updating bio:", error);
      Alert.alert("Error", "No se pudo actualizar la bio");
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
            <Text className="text-blue-500">Cambiar imagen de perfil</Text>
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

            {/* Si el usuario es Tatuador o Diseñador, aparecerá el actualizar bio */}
            {user?.role === "tattoo_artist" || user?.role === "Designer" ? (
              <View className="mb-4">
                <Text className="text-lg mb-2">Bio</Text>
                <TextInput
                  className="bg-gray-300 dark:bg-gray-800 p-2 rounded-md dark:text-white"
                  value={bio ?? ""}
                  onChangeText={setBio}
                  placeholder="Ingrese bio"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#999" : "#666"
                  }
                />
                <TouchableOpacity
                  className="bg-blue-500 p-2 rounded-md mt-2"
                  onPress={updateBio}
                  disabled={loading}
                >
                  <Text className="text-white text-center">
                    {loading ? "Actualizando..." : "Actualizar bio"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
