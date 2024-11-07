import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  useColorScheme,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../context/userContext";

interface Project {
  id: number;
  designer_id: number;
  title: string;
  description: string;
  price: string;
  currency: string;
  image?: string;
  username: string;
  status: "available" | "pending" | "accepted" | "rejected";
  is_available: boolean;
}

interface RouteParams {
  id: string;
}

type AvailableDesignsRouteProp = RouteProp<{ params: RouteParams }, "params">;

const SERVER_URL = "http://192.168.100.87:3000"; // Cambia esto a la IP de tu servidor

const AvailableDesigns = () => {
  const route = useRoute<AvailableDesignsRouteProp>();
  const { id } = route.params; // ID del diseñador
  const { user } = useContext(UserContext);
  const [designs, setDesigns] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    fetchAvailableDesigns();
  }, [id]);

  const fetchAvailableDesigns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/designer/projects/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener diseños disponibles");
      }
      const data = await response.json();
      setDesigns(data);
    } catch (error) {
      console.error("Error al obtener diseños disponibles:", error);
      Alert.alert("Error", "No se pudieron obtener los diseños disponibles.");
    } finally {
      setLoading(false);
    }
  };

  // Función para confirmar solicitud de un diseño específico
  const confirmDesignRequest = async (projectId: number) => {
    try {
      const formData = new FormData();
      formData.append("buyer_id", user?.id.toString());
      formData.append("designer_id", id.toString());
      formData.append("project_id", projectId.toString());
      formData.append("status", "pending");
      formData.append("message", "Solicitud de diseño");

      if (imageUri) {
        formData.append("reference_image", {
          uri: imageUri,
          name: "reference-image.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await fetch(`${SERVER_URL}/design-requests`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // No necesitas establecer "Content-Type" cuando usas FormData
        },
      });

      if (response.ok) {
        Alert.alert(
          "Éxito",
          "Solicitud de diseño enviada. Espera la confirmación del diseñador."
        );
        fetchAvailableDesigns(); // Refresh the list
      } else {
        const errorResponse = await response.json();
        console.error("Error del servidor:", errorResponse);
        Alert.alert("Error", "No se pudo procesar la solicitud de diseño.");
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      Alert.alert("Error", "Hubo un problema al procesar tu solicitud.");
    }
  };

  // Función para abrir el modal de solicitud de diseño personalizado
  const openCustomDesignModal = () => {
    setModalVisible(true);
  };

  // Función para cerrar el modal de solicitud de diseño personalizado
  const closeCustomDesignModal = () => {
    setModalVisible(false);
    setMessage("");
    setImageUri(null);
  };

  // Función para seleccionar una imagen de referencia
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
      setImageUri(result.assets[0].uri);
    }
  };

  // Función para enviar una solicitud de diseño personalizado
  const submitCustomDesignRequest = async () => {
    if (!message) {
      Alert.alert("Error", "Por favor ingresa un mensaje.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("buyer_id", user.id.toString());
      formData.append("designer_id", parseInt(id).toString());
      formData.append("message", message);

      if (imageUri) {
        formData.append("reference_image", {
          uri: imageUri,
          name: "reference-image.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await fetch(`${SERVER_URL}/design-requests`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // No necesitas establecer "Content-Type" cuando usas FormData
        },
      });

      if (response.ok) {
        Alert.alert("Éxito", "Solicitud de diseño personalizada enviada.");
        closeCustomDesignModal();
        fetchAvailableDesigns();
      } else {
        const errorResponse = await response.json();
        console.error("Error del servidor:", errorResponse);
        Alert.alert("Error", "No se pudo enviar la solicitud personalizada.");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud personalizada:", error);
      Alert.alert("Error", "Hubo un problema al enviar tu solicitud.");
    }
  };

  const renderDesign = ({ item }: { item: Project }) => (
    <View
      className={`p-4 border-b border-gray-300 rounded mb-2 ${
        colorScheme === "dark" ? "bg-neutral-800" : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-lg font-bold ${
          colorScheme === "dark" ? "text-white" : "text-black"
        }`}
      >
        {item.title}
      </Text>
      <Text
        className={`mb-2 ${
          colorScheme === "dark" ? "text-gray-400" : "text-gray-700"
        }`}
      >
        {item.description}
      </Text>
      <Text className="text-green-600 mb-2">
        Precio: {item.price} {item.currency}
      </Text>
      {item.image && (
        <Image
          source={{ uri: `${SERVER_URL}${item.image}` }}
          className="w-full h-auto aspect-[4/5] rounded mb-2"
          resizeMode="cover"
        />
      )}
      <Text
        className={`text-base font-medium mb-2 ${
          item.status === "available" ? "text-green-600" : "text-red-600"
        }`}
      >
        Estado: {item.status}
      </Text>
      {item.status === "available" && (
        <TouchableOpacity
          onPress={() => confirmDesignRequest(item.id)}
          className="p-3 rounded bg-blue-600 mt-2"
        >
          <Text className="text-white text-center">Solicitar Diseño</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {/* Botón para solicitar un diseño personalizado */}
      <TouchableOpacity
        onPress={openCustomDesignModal}
        className={`p-3 rounded mb-4 ${
          colorScheme === "dark" ? "bg-gray-700" : "bg-blue-600"
        }`}
      >
        <Text className="text-white text-center">
          Solicitar Diseño Personalizado
        </Text>
      </TouchableOpacity>

      {designs.length === 0 ? (
        <Text className="text-center mt-5 text-lg text-gray-600">
          No hay diseños disponibles.
        </Text>
      ) : (
        <FlatList
          data={designs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDesign}
        />
      )}

      {/* Modal para la solicitud de diseño personalizado */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCustomDesignModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`w-[80%] p-4 rounded-xl ${
              colorScheme === "dark" ? "bg-neutral-800" : "bg-white"
            }`}
          >
            <Text
              className={`text-xl font-bold mb-4 ${
                colorScheme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Solicitar Diseño Personalizado
            </Text>

            <TextInput
              placeholder="Escribe tu mensaje..."
              value={message}
              onChangeText={setMessage}
              className={`border border-gray-300 rounded p-2 h-32 ${
                colorScheme === "dark" ? "text-white" : "text-black"
              }`}
              multiline
            />

            <TouchableOpacity
              onPress={pickImage}
              className={`p-3 rounded mt-4 ${
                colorScheme === "dark" ? "bg-gray-600" : "bg-green-600"
              }`}
            >
              <Text className="text-white text-center">
                Seleccionar Imagen de Referencia
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: "100%",
                  height: 200,
                  marginTop: 16,
                  borderRadius: 8,
                }}
              />
            )}

            <TouchableOpacity
              onPress={submitCustomDesignRequest}
              className="bg-blue-500 p-3 rounded mt-4"
            >
              <Text className="text-white text-center font-bold">
                Enviar Solicitud
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeCustomDesignModal}
              className="bg-gray-500 p-3 rounded mt-2"
            >
              <Text className="text-white text-center font-bold">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AvailableDesigns;
