import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  useColorScheme,
  View,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Text } from "../../components/Themed";
import { UserContext } from "../context/userContext";
import { Picker } from "@react-native-picker/picker";
import { SERVER_URL } from "@/constants/constants";

interface RequestedDesign {
  id: number;
  designer_id: number;
  project_id: number;
  price: string;
  status: string;
  created_at: string;
  image: string;
  user_id: number;
  username: string;
}

const getFullImageUrl = (imagePath: string) => {
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `${SERVER_URL}${imagePath}`;
};

const statusMap = {
  Accepted: "Aceptado",
  Rejected: "Rechazado",
  Pending: "Pendiente",
};

const reverseStatusMap = {
  Aceptado: "Accepted",
  Rechazado: "Rejected",
  Pendiente: "Pending",
};

export default function RequestedDesigns() {
  const [designs, setDesigns] = useState<RequestedDesign[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const { user } = useContext(UserContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  useEffect(() => {
    if (user && user.id) {
      fetchRequestedDesigns();
    } else {
      console.log("Usuario no disponible aún", user);
    }
  }, [user]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/designer-projects/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      setDesigns((prevDesigns) =>
        prevDesigns.map((design) =>
          design.id === id ? { ...design, status: newStatus } : design
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", (error as Error).message);
    }
  };

  const fetchRequestedDesigns = async () => {
    if (!user?.id) {
      console.log("Error: user.id no disponible");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${SERVER_URL}/designer-projects/${user.id}/requests`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch designs");
      }
      const data = await response.json();
      setDesigns(data);
      console.log("Designs fetched:", data);
    } catch (error) {
      console.error("Error fetching designs:", error);
      Alert.alert("Error", "No se pudieron cargar los diseños");
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (item: RequestedDesign) => {
    if (!user || !replyMessage) {
      Alert.alert("Error", "Mensaje vacío o usuario no disponible");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: user?.id,
          receiver_id: item.user_id,
          content: replyMessage,
        }),
      });

      if (response.ok) {
        Alert.alert("Mensaje enviado", "El mensaje fue enviado con éxito.");
        setReplyMessage("");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending reply message:", error);
      Alert.alert("Error", "No se pudo enviar el mensaje");
    }
  };

  const showStatusPicker = (item: RequestedDesign) => {
    const options = ["Aceptado", "Rechazado", "Pendiente", "Cancelar"];
    const destructiveIndex = -1;
    const cancelButtonIndex = options.length - 1;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveIndex,
        title: "Seleccionar Estado",
      },
      (buttonIndex: number) => {
        if (buttonIndex !== cancelButtonIndex) {
          const selectedOption = options[
            buttonIndex
          ] as keyof typeof reverseStatusMap;
          const newStatus = reverseStatusMap[selectedOption];
          updateStatus(item.id, newStatus);
        }
      }
    );
  };

  const renderDesign = ({ item }: { item: RequestedDesign }) => (
    <View className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <View className="flex-row">
        <TouchableOpacity onPress={() => setSelectedImage(item.image)}>
          <Image
            className="w-24 h-24 rounded-md"
            source={{ uri: getFullImageUrl(item.image) }}
          />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-lg font-semibold dark:text-white">
            Cliente: {item.username}
          </Text>
          <Text className="text-gray-600 dark:text-gray-300">
            Precio: ${parseFloat(item.price).toFixed(2)}
          </Text>
          <Text className="text-gray-600 dark:text-gray-300">
            Fecha: {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <View className="mt-2">
            <Text className="text-gray-700 dark:text-gray-200 mb-1">
              Estado:
            </Text>
            <View className="border border-gray-300 dark:border-gray-600 rounded">
              {Platform.OS === "ios" ? (
                <TouchableOpacity
                  onPress={() => showStatusPicker(item)}
                  style={{
                    height: 44,
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ color: isDarkMode ? "white" : "black" }}>
                    {statusMap[item.status as keyof typeof statusMap]}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Picker
                  selectedValue={item.status}
                  onValueChange={(newStatus) =>
                    updateStatus(item.id, newStatus)
                  }
                  style={{
                    color: isDarkMode ? "white" : "black",
                    backgroundColor: "transparent",
                  }}
                >
                  <Picker.Item label="Aceptado" value="Accepted" />
                  <Picker.Item label="Rechazado" value="Rejected" />
                  <Picker.Item label="Pendiente" value="Pending" />
                </Picker>
              )}
            </View>
          </View>
        </View>
      </View>
      <View className="mt-4">
        <TextInput
          placeholder="Escribe tu respuesta..."
          placeholderTextColor={isDarkMode ? "#a0aec0" : "#718096"}
          value={replyMessage}
          onChangeText={(text) => setReplyMessage(text)}
          className="border border-gray-300 dark:border-gray-600 p-2 rounded text-black dark:text-white"
        />
        <TouchableOpacity
          onPress={() => sendReply(item)}
          className="bg-blue-500 rounded-md py-2 px-4 mt-2"
        >
          <Text className="text-white text-center font-semibold">
            Enviar mensaje
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-gray-900">
      <FlatList
        data={designs}
        renderItem={renderDesign}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <Text className="text-center mt-5 text-base text-gray-500 dark:text-gray-400">
            No hay diseños solicitados
          </Text>
        )}
      />
      <Modal visible={!!selectedImage} transparent={true}>
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-80 justify-center items-center"
          onPress={() => setSelectedImage(null)}
        >
          <Image
            source={{
              uri: selectedImage ? getFullImageUrl(selectedImage) : "",
            }}
            className="w-[90%] h-[90%]"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
