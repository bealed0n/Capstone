import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { UserContext } from "../context/userContext";
import { Text, View } from "../../components/Themed";
import { SERVER_URL } from "@/constants/constants";

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

const getFullImageUrl = (imagePath: string) => {
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `${SERVER_URL}${imagePath}`;
};

export default function UserRequested() {
  const { user } = useContext(UserContext);
  const [designs, setDesigns] = useState<RequestedDesign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.id) {
      fetchRequestedDesigns();
    }
  }, [user]);

  const fetchRequestedDesigns = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/requested-designs/${user.id}`
      );
      if (!response.ok) {
        throw new Error("No se pudieron cargar los diseños solicitados");
      }
      const data = await response.json();
      setDesigns(data);
    } catch (error) {
      console.error("Error fetching requested designs:", error);
      Alert.alert("Error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderDesign = ({ item }: { item: RequestedDesign }) => (
    <View className="p-3 bg-neutral-200 dark:bg-neutral-800 rounded-md mb-3">
      <Text>Designer ID: {item.designer_id}</Text>
      <Text>Price: ${parseFloat(item.price).toFixed(2)}</Text>
      <Text>Status: {item.status}</Text>
      <TouchableOpacity onPress={() => setSelectedImage(item.image)}>
        <Image
          source={{ uri: getFullImageUrl(item.image) }}
          className="w-full h-40 mt-2 rounded"
          resizeMode="cover"
        />
      </TouchableOpacity>
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
      <Text className="text-2xl font-bold mb-4">Tus diseños solicitados</Text>
      <FlatList
        data={designs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDesign}
        ListEmptyComponent={() => (
          <Text className="text-center mt-5 text-base text-gray-500">
            No hay diseños solicitados
          </Text>
        )}
      />

      {/* Modal para mostrar la imagen en grande */}
      <Modal visible={!!selectedImage} transparent={true}>
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-80 justify-center items-center"
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <Image
              source={{ uri: getFullImageUrl(selectedImage) }}
              className="w-[90%] h-[70%]"
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
