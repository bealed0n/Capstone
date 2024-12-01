import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Text, View } from "../../../components/Themed";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { useRoute } from "@react-navigation/native";
import { SERVER_URL } from "../../../constants/constants";

interface TattooStudio {
  id: number;
  owner_id: number;
  name: string;
  address: string;
  description: string;
  image_url: string | null;
  created_at: string;
  status: string;
}

export default function StudioEdit() {
  const [studio, setStudio] = useState<TattooStudio | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const route = useRoute();
  const { id } = route.params as { id: number };

  useEffect(() => {
    fetchStudioDetails();
    requestMediaLibraryPermissions();
  }, [id]);

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera roll permissions are needed."
      );
    }
  };

  const fetchStudioDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/tattoo-studio/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch studio details");
      }
      const data = await response.json();
      setStudio(data);
      setName(data.name);
      setAddress(data.address);
      setDescription(data.description);
      if (data.image_url) {
        setImageUri(`${SERVER_URL}${data.image_url}`);
      }
    } catch (error) {
      console.error("Error fetching studio details:", error);
      Alert.alert("Error", "Failed to load studio details");
    } finally {
      setLoading(false);
    }
  };

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
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await uploadStudioImage(uri);
    }
  };

  const uploadStudioImage = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", {
        uri,
        type: "image/jpeg",
        name: "studio-image.jpg",
      } as any);

      const response = await fetch(`${SERVER_URL}/tattoo-studios/${id}/image`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload studio image");
      }

      const updatedStudio = await response.json();
      setStudio((prevStudio) => ({ ...prevStudio, ...updatedStudio }));
      setImageUri(`${SERVER_URL}${updatedStudio.image_url}`);
      Alert.alert("Success", "Studio image updated successfully");
    } catch (error) {
      console.error("Error uploading studio image:", error);
      Alert.alert("Error", "Failed to upload studio image");
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (
    field: "name" | "address" | "description",
    value: string
  ) => {
    if (!value.trim()) {
      Alert.alert("Error", `${field} cannot be empty`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${SERVER_URL}/tattoo-studios/${id}/${field}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update studio ${field}`);
      }

      const updatedStudio = await response.json();
      setStudio((prevStudio) => ({ ...prevStudio, ...updatedStudio }));
      Alert.alert("Success", `${field} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Alert.alert("Error", `Failed to update ${field}`);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (loading && !studio) {
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
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          <View className="mb-6">
            <Text className="text-2xl font-bold mb-4">Editar estudio</Text>

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
              <Text className="text-blue-500">Cambiar imagen de estudio</Text>
            </TouchableOpacity>

            <View className="mb-4">
              <Text className="text-lg mb-2">Nombre</Text>
              <TextInput
                className="bg-gray-300 dark:bg-gray-800 p-2 rounded-md dark:text-white"
                value={name}
                onChangeText={setName}
                placeholder="Ingrese nombre del estudio"
              />
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded-md mt-2"
                onPress={() => {
                  dismissKeyboard();
                  updateField("name", name);
                }}
                disabled={loading}
              >
                <Text className="text-white text-center">
                  {loading ? "Actualizando..." : "Actualizar nombre"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-lg mb-2">Dirección</Text>
              <TextInput
                className="bg-gray-300 dark:bg-gray-800 p-2 rounded-md dark:text-white"
                value={address}
                onChangeText={setAddress}
                placeholder="Ingrese dirección"
              />
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded-md mt-2"
                onPress={() => {
                  dismissKeyboard();
                  updateField("address", address);
                }}
                disabled={loading}
              >
                <Text className="text-white text-center">
                  {loading ? "Actualizando..." : "Actualizar dirección"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-lg mb-2">Descripción</Text>
              <TextInput
                className="bg-gray-300 dark:bg-gray-800 p-2 rounded-md dark:text-white h-32"
                value={description}
                onChangeText={setDescription}
                placeholder="Ingrese descripción"
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded-md mt-2"
                onPress={() => {
                  dismissKeyboard();
                  updateField("description", description);
                }}
                disabled={loading}
              >
                <Text className="text-white text-center">
                  {loading ? "Actualizando..." : "Actualizar descripción"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
