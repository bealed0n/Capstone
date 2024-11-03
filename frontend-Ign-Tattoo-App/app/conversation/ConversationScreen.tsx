import React, { useContext, useEffect, useState, useRef } from "react";
import {
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
  Keyboard,
} from "react-native";
import { Text } from "../../components/Themed";
import { useRoute, RouteProp } from "@react-navigation/native";
import { UserContext } from "../context/userContext";
import { styled } from "nativewind";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "react-native";
import { format, isSameDay, parseISO } from "date-fns";

const StyledImage = styled(Image);

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  image_url: string | null;
  sent_at: string;
  is_read: boolean;
}

interface RouteParams {
  conversationId: number;
}

export default function ConversationScreen() {
  const { user } = useContext(UserContext);
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { conversationId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (user) {
        try {
          const response = await fetch(
            `http://192.168.100.87:3000/user/${user.id}/messages`
          );
          const data: { messages: Message[] } = await response.json();
          const messagesData = data.messages
            .filter(
              (message: Message) =>
                (message.receiver_id === Number(user.id) &&
                  message.sender_id === Number(conversationId)) ||
                (message.sender_id === Number(user.id) &&
                  message.receiver_id === Number(conversationId))
            )
            .sort(
              (a, b) =>
                new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
            );
          setMessages(messagesData);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
    fetchMessages();
  }, [user, conversationId]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender_id === user.id;
    return (
      <View
        className={`flex-row items-start my-2 ${isUserMessage ? "justify-end" : "justify-start"}`}
      >
        {!isUserMessage && (
          <StyledImage
            source={require("@/assets/images/user.png")}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <View
          className={`p-3 rounded-lg shadow-sm ${
            isUserMessage ? "bg-blue-500 mr-3" : "bg-neutral-800 ml-3"
          } max-w-[75%]`}
        >
          <Text
            className={`${isUserMessage ? "text-white" : "text-white"} font-medium`}
            style={{ flexWrap: "wrap", lineHeight: 20 }}
          >
            {item.content}
          </Text>
          <Text className="text-xs text-gray-200 mt-1 text-right">
            {new Date(item.sent_at).toLocaleTimeString()}
          </Text>
        </View>
        {isUserMessage && (
          <StyledImage
            source={require("@/assets/images/user.png")}
            className="w-8 h-8 rounded-full ml-2"
          />
        )}
      </View>
    );
  };

  const renderDateSeparator = (dateString: string) => (
    <View className="my-4">
      <Text className="text-center text-gray-500">
        {format(new Date(dateString), "dd/MM/yyyy")}
      </Text>
    </View>
  );

  const renderMessagesWithDateSeparators = () => {
    const messagesWithSeparators: {
      id: string | number;
      type: string;
      date?: string;
      sender_id?: number;
      receiver_id?: number;
      content?: string;
      image_url?: string | null;
      sent_at?: string;
      is_read?: boolean;
    }[] = [];
    let lastDate: string | number | Date | null = null;
    messages.forEach((message) => {
      const messageDate = parseISO(message.sent_at);
      if (!lastDate || !isSameDay(messageDate, lastDate)) {
        messagesWithSeparators.push({
          id: `separator-${message.id}`,
          type: "separator",
          date: message.sent_at,
        });
        lastDate = messageDate;
      }
      messagesWithSeparators.push({
        ...message,
        type: "message",
      });
    });
    return messagesWithSeparators;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Ajusta según sea necesario
    >
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={renderMessagesWithDateSeparators()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) =>
            item.type === "separator"
              ? renderDateSeparator(item.date)
              : renderMessage({ item })
          }
          contentContainerStyle={{ paddingBottom: 80 }} // Ajustar espacio para la barra de envío
        />
        <View className="bottom-0 bg-white p-3 border-t border-gray-300 flex-row items-center">
          <TouchableOpacity className="mr-2">
            <MaterialIcons name="attach-file" size={24} color="gray" />
          </TouchableOpacity>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
          />
          <TouchableOpacity className="ml-2">
            <MaterialIcons name="send" size={24} color="blue" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
