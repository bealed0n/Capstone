import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { View, Text } from "../../components/Themed";
import { UserContext } from "../context/userContext";

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

const SERVER_URL = "http://192.168.100.87:3000";

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

  useEffect(() => {
    if (user && user.id) {
      fetchRequestedDesigns();
    } else {
      console.log("Usuario no disponible aún", user);
    }
  }, [user]);

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
        setReplyMessage(""); // Limpiar el mensaje después de enviarlo
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending reply message:", error);
      Alert.alert("Error", "No se pudo enviar el mensaje");
    }
  };

  // Renderizado del diseño
  const renderDesign = ({ item }: { item: RequestedDesign }) => (
    <View className="flex-row p-3 bg-neutral-200 dark:bg-neutral-800 rounded-md mb-3 shadow-black dark:shadow-inherit">
      <TouchableOpacity onPress={() => setSelectedImage(item.image)}>
        <Image
          className="mt-2"
          source={{ uri: getFullImageUrl(item.image) }}
          style={styles.thumbnail}
        />
      </TouchableOpacity>

      <View className="flex-1 ml-3 bg-neutral-200 dark:bg-neutral-800">
        <Text>Client: {item.username}</Text>
        <Text>Price: ${parseFloat(item.price).toFixed(2)}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Date: {new Date(item.created_at).toLocaleDateString()}</Text>

        {/* Input y botón de Reply */}
        <TextInput
          placeholder="Escribe tu respuesta..."
          value={replyMessage}
          onChangeText={(text) => setReplyMessage(text)}
          style={styles.replyInput}
        />
        <TouchableOpacity onPress={() => sendReply(item)}>
          <Text style={styles.replyButton}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Requested Designs</Text>

      <FlatList
        data={designs}
        renderItem={renderDesign}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No hay diseños solicitados</Text>
        )}
      />

      <Modal visible={!!selectedImage} transparent={true}>
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setSelectedImage(null)}
        >
          <Image
            source={{
              uri: selectedImage ? getFullImageUrl(selectedImage) : "",
            }}
            style={styles.modalImage}
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  replyInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 8,
    marginTop: 8,
    borderRadius: 5,
  },
  replyButton: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
});
