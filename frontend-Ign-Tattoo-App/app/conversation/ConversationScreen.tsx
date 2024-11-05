import React, { useContext, useEffect, useState, useRef } from "react";
import {
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
  useColorScheme,
  Alert,
} from "react-native";
import { Text } from "../../components/Themed";
import { useRoute, RouteProp } from "@react-navigation/native";
import { UserContext } from "../context/userContext";
import { styled } from "nativewind";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "react-native";
import { format, isSameDay, parseISO } from "date-fns";
import io from "socket.io-client";

const StyledImage = styled(Image);

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  image_url: string | null;
  sent_at: string;
  is_read: boolean;
  tempId?: number; // Añadimos tempId opcional
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
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      const socket = io("http://192.168.100.87:3000", {
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

        const isUserMessage = Number(message.sender_id) === userId;

        if (
          (Number(message.receiver_id) === userId ||
            Number(message.sender_id) === userId) &&
          (Number(message.receiver_id) === Number(conversationId) ||
            Number(message.sender_id) === Number(conversationId))
        ) {
          setMessages((prevMessages) => {
            if (isUserMessage) {
              // Reemplazar el mensaje temporal con el mensaje real del servidor
              return prevMessages.map((msg) => {
                if (msg.tempId && msg.tempId === message.tempId) {
                  return message;
                }
                return msg;
              });
            } else {
              // Agregar el mensaje recibido de otro usuario
              return [...prevMessages, message];
            }
          });
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (user) {
        try {
          const response = await fetch(
            `http://192.168.100.87:3000/user/${user.id}/messages`
          );

          if (!response.ok) {
            throw new Error("Error fetching messages");
          }

          const data: { messages: Message[] } = await response.json();
          const userId = Number(user.id);
          const conversationIdNum = Number(conversationId);

          console.log("Conversation ID:", conversationId);

          const messagesData = data.messages
            .filter((message: Message) => {
              const isInConversation =
                (Number(message.sender_id) === userId &&
                  Number(message.receiver_id) === conversationIdNum) ||
                (Number(message.receiver_id) === userId &&
                  Number(message.sender_id) === conversationIdNum);

              return isInConversation;
            })
            .sort(
              (a, b) =>
                new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
            );

          console.log("Filtered messages:", messagesData);
          setMessages(messagesData);
        } catch (error) {
          console.error("Error fetching messages:", error);
          Alert.alert("Error", "No se pudieron cargar los mensajes.");
        }
      }
    };

    fetchMessages();
  }, [user, conversationId]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = Number(item.sender_id) === Number(user?.id);
    return (
      <View
        className={`flex-row items-start my-2 ${
          isUserMessage ? "justify-end" : "justify-start"
        }`}
      >
        {!isUserMessage && (
          <StyledImage
            source={require("@/assets/images/user.png")}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <View
          className={`p-3 rounded-lg shadow-sm ${
            isUserMessage ? "bg-blue-500 mr-3" : "bg-neutral-500 ml-3"
          } max-w-[75%]`}
        >
          <Text className="text-white font-medium">{item.content}</Text>
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
    }[] = [];
    let lastDate: Date | null = null;
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

  const colorScheme = useColorScheme();
  const sendColor = colorScheme === "dark" ? "white" : "blue";

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isSending && user) {
      setIsSending(true);
      const userId = Number(user.id);
      const conversationIdNum = Number(conversationId);

      const tempId = Date.now(); // Genera un ID temporal único

      const messageData: Message = {
        id: tempId, // Usamos id temporal
        sender_id: userId,
        receiver_id: conversationIdNum,
        content: newMessage,
        image_url: null,
        sent_at: new Date().toISOString(),
        is_read: false,
        tempId: tempId, // Guardamos tempId para referencia
      };

      try {
        // Agrega el mensaje temporalmente a la vista
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage("");

        if (socketRef.current) {
          socketRef.current.emit("message", messageData);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert("Error", "No se pudo enviar el mensaje. Intenta de nuevo.");
      } finally {
        setIsSending(false);
      }
    } else {
      Alert.alert("Error", "El mensaje no puede estar vacío.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
      className="bg-white dark:bg-neutral-800"
    >
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={renderMessagesWithDateSeparators()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) =>
            item.type === "separator"
              ? renderDateSeparator(item.date!)
              : renderMessage({ item })
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          initialNumToRender={10}
        />
        <View className="bottom-0 ios:mb-5 ios:p-3 border-t bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-500 flex-row items-center">
          <TouchableOpacity className="mr-2">
            <MaterialIcons name="attach-file" size={24} color="gray" />
          </TouchableOpacity>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity className="ml-2" onPress={handleSendMessage}>
            <MaterialIcons name="send" size={24} color={sendColor} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
