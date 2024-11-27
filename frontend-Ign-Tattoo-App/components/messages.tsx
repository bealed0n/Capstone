import React, { useContext, useEffect, useState, useRef } from "react";
import {
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, View } from "../components/Themed";
import { useRouter } from "expo-router";
import { UserContext } from "../app/context/userContext";
import { SERVER_URL } from "@/constants/constants";
import io from "socket.io-client";

interface Message {
  id: number;
  sender_id: number;
  sender_username: string;
  receiver_id: number;
  receiver_username: string;
  content: string;
  image_url: string | null;
  sent_at: string;
  is_read: boolean;
  sender_profile_pic?: string;
  receiver_profile_pic?: string;
}

interface Conversation {
  id: number;
  sender_id: number;
  sender_username: string;
  receiver_id: number;
  receiver_username: string;
  content: string;
  image_url: string | null;
  sent_at: string;
  is_read: boolean;
  sender_profile_pic?: string;
  receiver_profile_pic?: string;
}

interface MessagesProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function Messages({ refreshing, onRefresh }: MessagesProps) {
  const { user } = useContext(UserContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();
  const socketRef = useRef<any>(null);

  const fetchConversations = async () => {
    if (user) {
      try {
        const response = await fetch(
          `${SERVER_URL}/user/${user.id}/conversations`
        );
        const data = await response.json();
        setConversations(data.conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    }
  };

  useEffect(() => {
    fetchConversations();

    if (user) {
      const socket = io(SERVER_URL, {
        autoConnect: true,
      });

      socketRef.current = socket;

      const userId = Number(user.id);

      socket.on("connect", () => {
        console.log("Socket.IO connected");
        socket.emit("joinRoom", userId.toString());
        console.log(`Joined room: ${userId}`);
      });

      socket.on("disconnect", () => console.log("Socket.IO disconnected"));

      socket.on("newMessage", (message: Message) => {
        console.log("New message received:", message);

        // Actualizar la lista de conversaciones con el nuevo mensaje
        setConversations((prevConversations) => {
          const otherUserId =
            message.sender_id === userId
              ? message.receiver_id
              : message.sender_id;

          const existingIndex = prevConversations.findIndex(
            (conv) =>
              (conv.sender_id === otherUserId && conv.receiver_id === userId) ||
              (conv.receiver_id === otherUserId && conv.sender_id === userId)
          );

          if (existingIndex > -1) {
            // Actualizar conversación existente
            const updatedConversations = [...prevConversations];
            updatedConversations[existingIndex] = {
              ...updatedConversations[existingIndex],
              content: message.content,
              sent_at: message.sent_at,
              is_read: message.is_read,
            };
            // Mover la conversación actualizada al inicio
            const updatedConversation = updatedConversations.splice(
              existingIndex,
              1
            )[0];
            return [updatedConversation, ...updatedConversations];
          } else {
            // Agregar nueva conversación
            const newConversation: Conversation = {
              id: message.id,
              sender_id: message.sender_id,
              sender_username: message.sender_username,
              receiver_id: message.receiver_id,
              receiver_username: message.receiver_username,
              content: message.content,
              image_url: message.image_url,
              sent_at: message.sent_at,
              is_read: message.is_read,
              sender_profile_pic: message.sender_profile_pic,
              receiver_profile_pic: message.receiver_profile_pic,
            };
            return [newConversation, ...prevConversations];
          }
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              console.log(
                "Redirecting to conversation with ID:",
                item.sender_id === user.id ? item.receiver_id : item.sender_id
              );
              router.push({
                pathname: "/conversation/ConversationScreen",
                params: {
                  conversationId:
                    item.sender_id === user.id
                      ? item.receiver_id
                      : item.sender_id,
                },
              });
            }}
          >
            <View className="flex-row p-2 mx-3 my-1 shadow-lg rounded-lg bg-neutral-200 dark:bg-neutral-800">
              <Image
                source={{
                  uri:
                    SERVER_URL +
                    (item.sender_id === user.id
                      ? item.receiver_profile_pic
                      : item.sender_profile_pic),
                }}
                className="w-10 h-10 rounded-full mr-4"
              />
              <View className="flex-1 bg-neutral-200 dark:bg-neutral-800">
                <Text className="font-bold mb-1">
                  {item.sender_id === user.id
                    ? item.receiver_username
                    : item.sender_username}
                </Text>
                <Text className="mb-1">{item.content}</Text>
                <Text className="text-xs text-gray-500">
                  {new Date(item.sent_at).toLocaleString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-gray-500">
              No tienes conversaciones
            </Text>
          </View>
        }
      />
    </View>
  );
}
