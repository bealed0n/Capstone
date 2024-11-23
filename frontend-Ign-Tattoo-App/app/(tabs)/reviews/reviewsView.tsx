import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { format } from "date-fns";

interface RouteParams {
  userId: string;
}

interface Review {
  review_text: string;
  rating: number;
  client_username: string;
  created_at: string;
}

interface ReviewsResponse {
  reviews: Review[];
}

const SERVER_URL = "http://192.168.100.87:3000";

export default function ReviewsView() {
  const route = useRoute();
  const { userId } = route.params as RouteParams;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/tattoo-artist/${userId}/reviews`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data: ReviewsResponse = await response.json();
      setReviews(data.reviews);
      console.log(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      Alert.alert("Error", "Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white">
          {item.client_username}
        </Text>
        <View className="flex-row items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesome5
              key={star}
              name="star"
              solid={star <= item.rating / 2}
              size={16}
              color={star <= item.rating / 2 ? "#FFC107" : "#E0E0E0"}
              style={{ marginLeft: 2 }}
            />
          ))}
        </View>
      </View>
      <Text className="text-gray-600 dark:text-gray-300 mb-2">
        {item.review_text}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {format(new Date(item.created_at), "MMMM d, yyyy")}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4B5563" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-gray-900">
      <View className="p-4 bg-white dark:bg-gray-800 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white">
          Reviews
        </Text>
      </View>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4B5563"]}
          />
        }
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center mt-10">
            <FontAwesome5 name="comment-slash" size={50} color="#9CA3AF" />
            <Text className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              No reviews yet
            </Text>
          </View>
        )}
      />
    </View>
  );
}
