import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Text, View } from "./Themed";

import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

const SERVER_URL = "http://192.168.100.87:3000"; // Cambia esto a la URL de tu servidor

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

interface CommentsModalProps {
  postId: number;
  userId: number;
  visible: boolean;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  postId,
  userId,
  visible,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    try {
      const response = await fetch(`${SERVER_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, content: newComment }),
      });

      const result = await response.json();

      if (result.success) {
        setComments([...comments, result.comment]);
        setNewComment("");
      } else {
        console.error("Error adding comment:", result.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const colorScheme = useColorScheme();
  const statusBarStyle = colorScheme === "dark" ? "light" : "dark";
  const iconColor = colorScheme === "dark" ? "white" : "black";
  const sendColor = colorScheme === "dark" ? "#90bbfc" : "#007bff";

  return (
    <Modal
      className="bg-white dark:bg-neutral-900"
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <StatusBar style={statusBarStyle} />
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
        <View className="flex-1">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-300 dark:border-neutral-600">
            <Text className="text-lg font-bold">Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="p-4 border-b border-gray-300 dark:border-neutral-600">
                <Text className="font-bold">{item.username}</Text>
                <Text className="mt-1">{item.content}</Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            )}
          />
          <View className="flex-row items-center p-4 border-t border-gray-300 dark:border-neutral-600">
            <TextInput
              className="flex-1 p-2 border border-gray-300 dark:border-neutral-600 rounded mr-2"
              placeholder="Add a comment..."
              placeholderTextColor={iconColor}
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <MaterialIcons name="send" size={24} color={sendColor} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CommentsModal;
