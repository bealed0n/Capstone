import React, { useState, useEffect, useContext } from "react";
import {
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  TouchableWithoutFeedback,
} from "react-native";
import { View, Text } from "./Themed";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserContext } from "../app/context/userContext";
import * as ImagePicker from "expo-image-picker";
import { SERVER_URL } from "@/constants/constants";

interface Review {
  id: number;
  review_text: string | null;
  rating: number | null;
  is_published: boolean;
  tattoo_image_url: string | null;
  created_at: string;
  tattoo_artist_name: string;
}

interface ClientReviewsProps {
  onRefresh: () => void;
}

export default function ClientReviews({ onRefresh }: ClientReviewsProps) {
  const { user } = useContext(UserContext);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/user/${user?.id}/reviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      const allReviews = [
        ...data.reviews.published,
        ...data.reviews.notPublished,
      ];
      setReviews(allReviews);
      console.log("Fetched reviews:", allReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedReview) return;

    try {
      const formData = new FormData();
      formData.append("review_text", reviewText);
      formData.append("rating", reviewRating.toString());

      if (reviewImage) {
        const filename = reviewImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : "image";
        formData.append("tattoo_image", {
          uri: reviewImage,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(
        `${SERVER_URL}/reviews/${selectedReview.id}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      Alert.alert("Success", "Review submitted successfully");
      setIsReviewModalVisible(false);
      fetchReviews();
      onRefresh(); // Llamar a la función de actualización pasada como prop
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setReviewImage(result.assets[0].uri);
    }
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <TouchableOpacity
      onPress={() => {
        if (!item.is_published) {
          setSelectedReview(item);
          setReviewText(item.review_text || "");
          setReviewRating(item.rating || 0);
          setReviewImage(item.tattoo_image_url);
          setIsReviewModalVisible(true);
        }
      }}
      className="bg-white dark:bg-neutral-800 p-4 mb-4 rounded-lg shadow"
    >
      <Text className="text-lg font-bold text-gray-800 dark:text-white mb-1">
        {item.tattoo_artist_name}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        {item.is_published ? "Publicada" : "No publicada"}
      </Text>
      {item.is_published && (
        <>
          <Text className="text-gray-800 dark:text-white mb-2">
            {item.review_text}
          </Text>
          <View className="flex-row mb-2 dark:bg-neutral-800">
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesome5
                key={star}
                name="star"
                solid={star <= (item.rating || 0)}
                size={16}
                color={star <= (item.rating || 0) ? "#FFC107" : "#E0E0E0"}
                style={{ marginRight: 4 }}
              />
            ))}
          </View>
          {item.tattoo_image_url && (
            <TouchableOpacity
              onPress={() => {
                setSelectedImageUrl(`${SERVER_URL}${item.tattoo_image_url}`);
                setIsImageModalVisible(true);
              }}
            >
              <Image
                source={{ uri: `${SERVER_URL}${item.tattoo_image_url}` }}
                className="w-full h-40 rounded-md mb-2"
              />
            </TouchableOpacity>
          )}
        </>
      )}
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-center text-gray-800 dark:text-white mb-4">
          No tienes reseñas aún.
        </Text>
        <Text className="text-lg text-center text-gray-800 dark:text-white mb-4">
          You don't have any reviews yet.
        </Text>
        <Image
          source={require("../assets/images/notfound.png")}
          className="w-48 h-48"
        />
      </View>
    );
  }

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
        Mis Reseñas
      </Text>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchReviews} />
        }
      />
      {/* Modal para la imagen expandida */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsImageModalVisible(false)}>
          <View className="flex-1 bg-black bg-opacity-80 justify-center items-center">
            {selectedImageUrl && (
              <Image
                source={{ uri: selectedImageUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={isReviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReviewModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white dark:bg-gray-800 p-4 rounded-lg w-4/5">
            <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Reseña tu experiencia
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded p-2 mb-4 text-gray-800 dark:text-white"
              placeholder="Escibe tu reseña aquí..."
              value={reviewText}
              onChangeText={setReviewText}
              placeholderTextColor={"gray"}
              multiline
            />
            <View className="flex-row justify-center mb-4 dark:bg-transparent">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                >
                  <FontAwesome5
                    name="star"
                    solid={star <= reviewRating} // Cambiado para usar reviewRating directamente
                    size={32}
                    color="#FFC107"
                    style={{ marginRight: 8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              className="bg-blue-500 p-2 rounded mb-4"
              onPress={pickImage}
            >
              <Text className="text-white text-center font-bold">
                {reviewImage ? "Cambiar imagen" : "Añadir Imagen"}
              </Text>
            </TouchableOpacity>
            {reviewImage && (
              <Image
                source={{ uri: reviewImage }}
                className="w-full h-40 rounded-md mb-4"
              />
            )}
            <View className="flex-row justify-between dark:bg-transparent">
              <TouchableOpacity
                className="bg-red-500 p-2 rounded flex-1 mr-2"
                onPress={() => setIsReviewModalVisible(false)}
              >
                <Text className="text-white text-center font-bold">
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded flex-1 ml-2"
                onPress={handleReviewSubmit}
              >
                <Text className="text-white text-center font-bold">
                  Enviar Reseña
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
