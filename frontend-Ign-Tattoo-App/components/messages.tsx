import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, View } from "../components/Themed";
import { useRouter } from "expo-router";
import { UserContext } from "../app/context/userContext";
import { styled } from "nativewind";

const StyledImage = styled(Image);

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
}

interface MessagesProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function Messages({ refreshing, onRefresh }: MessagesProps) {
  const { user } = useContext(UserContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  const fetchConversations = async () => {
    if (user) {
      try {
        const response = await fetch(
          `http://192.168.100.87:3000/user/${user.id}/conversations`
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
            <View className="flex-row p-2 mx-3 my-2 shadow-lg mb-4 rounded-lg bg-neutral-200 dark:bg-neutral-800">
              <StyledImage
                source={require("@/assets/images/user.png")}
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
      />
    </View>
  );
}
