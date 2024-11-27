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
} from "react-native";
import { Text } from "../../components/Themed";
import { UserContext } from "../context/userContext";
import RNPickerSelect from "react-native-picker-select";
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

export default function RequestedDesigns() {
  const [designs, setDesigns] = useState<RequestedDesign[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const { user } = useContext(UserContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isDark = isDarkMode ? "white" : "black";
  const backgroundPicker = isDarkMode ? "#525252" : "#a1a1aa";

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
      // Actualizar el estado local
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

  const renderDesign = ({ item }: { item: RequestedDesign }) => (
    <View className="flex-row p-3 bg-neutral-200 dark:bg-neutral-800 rounded-md mb-3 shadow">
      <TouchableOpacity onPress={() => setSelectedImage(item.image)}>
        <Image
          className="mt-2 w-20 h-20 rounded"
          source={{ uri: getFullImageUrl(item.image) }}
        />
      </TouchableOpacity>

      <View className="flex-1 ml-3">
        <Text>Client: {item.username}</Text>
        <Text>Price: ${parseFloat(item.price).toFixed(2)}</Text>
        <Text>Date: {new Date(item.created_at).toLocaleDateString()}</Text>

        {/* Picker de estado */}
        <View className="flex-row items-center">
          <Text>Status: </Text>
          <View style={{ width: 90 }}>
            <RNPickerSelect
              onValueChange={(newStatus) => updateStatus(item.id, newStatus)}
              items={[
                { label: "Accepted", value: "Accepted" },
                { label: "Rejected", value: "Rejected" },
                { label: "Pending", value: "Pending" },
              ]}
              value={item.status}
              style={{
                inputIOS: {
                  color: isDark,
                  backgroundColor: backgroundPicker,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                },
                inputAndroid: {
                  color: isDark,
                  backgroundColor: backgroundPicker,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                },
                placeholder: {
                  color: isDark,
                },
                modalViewBottom: {
                  backgroundColor: backgroundPicker,
                },
              }}
              useNativeAndroidPickerStyle={false}
              placeholder={{}}
            />
          </View>
        </View>

        {/* Input y botón de Reply */}
        <TextInput
          placeholder="Escribe tu respuesta..."
          placeholderTextColor={isDark}
          value={replyMessage}
          onChangeText={(text) => setReplyMessage(text)}
          className="border border-gray-300 p-2 mt-2 rounded text-black dark:text-white"
        />
        <TouchableOpacity onPress={() => sendReply(item)} className="mt-2">
          <Text className="text-blue-500 text-base font-bold">Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Requested Designs</Text>

      <FlatList
        data={designs}
        renderItem={renderDesign}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text className="text-center mt-5 text-base text-gray-500">
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
            style={{ resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
