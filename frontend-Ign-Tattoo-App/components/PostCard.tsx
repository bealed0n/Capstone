import React, { useState, useEffect, useContext } from "react";
import {
  Image,
  Dimensions,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { Text, View } from "./Themed";
import { formatDistanceToNow, parseISO } from "date-fns";
import { MaterialIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import CommentsModal from "./CommentsModal";
import { UserContext } from "../app/context/userContext";

interface CardExampleProps {
  username: string;
  content: string;
  role: string;
  image: string;
  userId: number;
  createdAt: string;
  postId: number;
}

interface Post {
  username: string;
  content: string;
  role: string;
  image: string;
  user_id: number;
  created_at: string;
  id: number;
}

const beautifyRole = (role: string) => {
  switch (role) {
    case "tattoo_artist":
      return "Tattoo Artist";
    case "designer":
      return "Designer";
    default:
      return role;
  }
};

const SERVER_URL = "http://192.168.100.87:3000"; // Cambia esto a la URL de tu servidor
const { width: SCREEN_WIDTH } = Dimensions.get("window"); // Obtener el ancho de la pantalla

export const CardExample = ({
  username,
  content,
  role,
  image,
  createdAt,
  userId,
  postId,
}: CardExampleProps) => {
  const { user } = useContext(UserContext);
  const [isExpanded, setIsExpanded] = useState(false); // Estado para controlar si el texto está expandido
  const [liked, setLiked] = useState(false); // Estado para controlar si el post ha sido "liked"
  const [commentsVisible, setCommentsVisible] = useState(false); // Estado para controlar la visibilidad de los comentarios
  const imageUrl = image ? `${SERVER_URL}${image}` : null;
  const timeAgo = formatDistanceToNow(parseISO(createdAt), { addSuffix: true });

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
          // Compartido con actividad específica
          console.log("Shared with activity type:", result.activityType);
        } else {
          // Compartido
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        // Compartir cancelado
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

  return (
    <View className="w-full bg-neutral-200 dark:bg-neutral-900 mb-1 overflow-hidden">
      {/* Header con Avatar, Username, Fecha y Cuadro Diseñador */}
      <View className="flex-row items-center p-3 relative">
        <Image
          source={require("@/assets/images/user.png")}
          className="w-11 h-11 rounded-full mr-3"
        />
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/profile/${userId}` as Href)}
        >
          <View>
            <Text className="text-base font-bold dark:text-white">
              @{username}
            </Text>
            <Text className="text-xs text-gray-500">{timeAgo}</Text>
          </View>
        </TouchableOpacity>
        {/* Cuadro "Diseñador" en la esquina superior derecha */}
        <View className="absolute right-2.5 top-2.5 bg-yellow-400 px-2 py-0.5 rounded">
          <Text className="text-black font-bold text-xs">
            {beautifyRole(role)}
          </Text>
        </View>
      </View>

      {/* Contenido del Post */}
      <View className="px-2 pb-1">
        <Text
          className="text-base text-black dark:text-white"
          numberOfLines={isExpanded ? undefined : 2} // Mostrar solo 2 líneas cuando no esté expandido
        >
          {content}
        </Text>

        {/* Botón "Show more" o "Show less" si el contenido es largo */}
        {content.length > 60 && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text className="text-neutral-600">
              {isExpanded ? "Show less" : "Show more"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Imagen del Post */}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.25 }} // Relación 4:5
        />
      )}
      {/* Botones de interaccion */}
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

      {/* Modal de comentarios */}
      <CommentsModal
        postId={postId}
        userId={userId}
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
      />
    </View>
  );
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <CardExample
      username={post.username}
      content={post.content}
      role={post.role}
      image={post.image}
      createdAt={post.created_at}
      userId={post.user_id}
      postId={post.id}
    />
  );
}
