import React, { useState, useEffect, useContext } from "react";
import {
  Image,
  Dimensions,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Text, View } from "./Themed";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MaterialIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import CommentsModal from "./CommentsModal";
import { UserContext } from "../app/context/userContext";
import { SERVER_URL } from "@/constants/constants";

interface CardExampleProps {
  username: string;
  content: string;
  role: string;
  image: string;
  userId: number;
  createdAt: string;
  postId: number;
  profile_pic: string;
  onUpdate: (updatedPost: Post) => void;
  onDelete: (deletedPostId: number) => void;
  isOwner: boolean;
}

interface Post {
  username: string;
  content: string;
  role: string;
  image: string;
  user_id: number;
  created_at: string;
  id: number;
  profile_pic: string;
}

const beautifyRole = (role: string) => {
  switch (role) {
    case "tattoo_artist":
      return "Tatuador";
    case "Designer":
      return "Diseñador";
    default:
      return role;
  }
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const CardExample = ({
  username,
  content,
  role,
  image,
  createdAt,
  userId,
  postId,
  profile_pic,
  onUpdate,
  onDelete,
  isOwner,
}: CardExampleProps) => {
  const { user } = useContext(UserContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const imageUrl = image ? `${SERVER_URL}${image}` : null;
  const timeAgo = formatDistanceToNow(parseISO(createdAt), {
    addSuffix: true,
    locale: es,
  });
  const defaultPhoto = require("@/assets/images/user.png");

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/posts/${postId}/isLiked`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user.id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.isLiked) {
          setLiked(true);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error checking if post is liked:", error.message);
        } else {
          console.error("Error checking if post is liked:", error);
        }
      }
    };

    checkIfLiked();
  }, [postId, user.id]);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${content}\n\nShared by @${username} on ${beautifyRole(role)}\n\n${imageUrl ? imageUrl : ""}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sharing:", error.message);
      } else {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/posts/${postId}/${liked ? "unlike" : "like"}`,
        {
          method: liked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setLiked(!liked);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error liking post:", error.message);
      } else {
        console.error("Error liking post:", error);
      }
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editedContent, user_id: user.id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setEditModalVisible(false);
      onUpdate(result);
      Alert.alert("Success", "Post updated successfully");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating post:", error.message);
      } else {
        console.error("Error updating post:", error);
      }
      Alert.alert("Error", "Failed to update post");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Eliminar publicación",
      "¿Estás seguro de que deseas eliminar esta publicación?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${SERVER_URL}/posts/${postId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: user.id }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();
              if (result.success) {
                onDelete(postId);
                Alert.alert("Eliminado", "Publicación eliminada correctamente");
              } else {
                Alert.alert("Error", result.message);
              }
            } catch (error) {
              if (error instanceof Error) {
                console.error("Error deleting post:", error.message);
              } else {
                console.error("Error deleting post:", error);
              }
              Alert.alert("Error", "Failed to delete post");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="w-full bg-neutral-200 dark:bg-neutral-900 mb-1 overflow-hidden">
      <View className="flex-row items-center p-3 relative">
        <Image
          source={
            profile_pic ? { uri: `${SERVER_URL}${profile_pic}` } : defaultPhoto
          }
          className="w-11 h-11 rounded-full mr-3"
        />
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/user/${userId}` as Href)}
        >
          <View>
            <Text className="text-base font-bold dark:text-white">
              @{username}
            </Text>
            <Text className="text-xs text-gray-500">{timeAgo}</Text>
          </View>
        </TouchableOpacity>
        <View
          className={`absolute right-2.5 top-2.5 px-2 py-0.5 rounded ${
            role === "Designer" ? "bg-indigo-500" : "bg-yellow-400"
          }`}
        >
          <Text
            className={`text-black font-bold text-xs
            ${role === "Designer" ? "text-white" : "text-black"}`}
          >
            {beautifyRole(role)}
          </Text>
        </View>
        {isOwner && (
          <View className="absolute right-2.5 bottom-2.5 flex-row">
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              className="mr-2"
            >
              <MaterialIcons name="edit" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <MaterialIcons name="delete" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="px-2 pb-1">
        <Text
          className="text-base text-black dark:text-white"
          numberOfLines={isExpanded ? undefined : 2}
        >
          {content}
        </Text>

        {content.length > 60 && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-neutral-600">
              {isExpanded ? "Show less" : "Show more"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.25 }}
        />
      )}
      <View className="flex-row justify-center p-2">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleLike}
        >
          <MaterialIcons
            name={liked ? "favorite" : "favorite-outline"}
            size={24}
            color={liked ? "red" : "gray"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mx-16"
          onPress={() => setCommentsVisible(true)}
        >
          <MaterialIcons name="add-comment" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleShare}
        >
          <MaterialIcons name="ios-share" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <CommentsModal
        postId={postId}
        userId={userId}
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg w-4/5">
            <TextInput
              value={editedContent}
              onChangeText={setEditedContent}
              multiline
              className="border border-gray-300 p-2 rounded mb-4"
            />
            <View className="flex-row justify-between bg-transparent">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="bg-gray-300 p-2 rounded"
              >
                <Text className="">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEdit}
                className="bg-blue-500 p-2 rounded"
              >
                <Text className="text-white">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function PostCard({
  post,
  onUpdate,
  onDelete,
  isOwner,
}: {
  post: Post;
  onUpdate: (updatedPost: Post) => void;
  onDelete: (deletedPostId: number) => void;
  isOwner: boolean;
}) {
  return (
    <CardExample
      username={post.username}
      profile_pic={post.profile_pic}
      content={post.content}
      role={post.role}
      image={post.image}
      createdAt={post.created_at}
      userId={post.user_id}
      postId={post.id}
      onUpdate={onUpdate}
      onDelete={onDelete}
      isOwner={isOwner}
    />
  );
}
