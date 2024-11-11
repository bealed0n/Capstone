import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { UserContext } from "../context/userContext";

interface RequestedDesign {
  id: number;
  user_id: number;
  designer_id: number;
  project_id: number;
  price: string;
  status: string;
  created_at: string;
  image: string;
}
const SERVER_URL = "http://192.168.100.87:3000";

export default function RequestedDesigns() {
  const [designs, setDesigns] = useState<RequestedDesign[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchRequestedDesigns();
  }, []);

  const fetchRequestedDesigns = async () => {
    if (!user?.id) {
      console.error("User ID is undefined");
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
    } catch (error) {
      console.error("Error fetching designs:", error);
      Alert.alert("Error", "No se pudieron cargar los diseños");
    } finally {
      setLoading(false);
    }
  };

  const renderDesign = ({ item }: { item: RequestedDesign }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setSelectedImage(item.image)}>
        <Image source={{ uri: item.image }} style={styles.thumbnail} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text>Project ID: {item.project_id}</Text>
        <Text>Price: ${parseFloat(item.price).toFixed(2)}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
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
            source={{ uri: selectedImage || "" }}
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
  card: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  info: {
    marginLeft: 12,
    flex: 1,
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
});
