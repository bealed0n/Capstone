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
  Keyboard,
  Image,
  Image as RNImage,
  Modal,
} from "react-native";
import { Text } from "../../components/Themed";
import { useRoute, RouteProp } from "@react-navigation/native";
import { UserContext } from "../context/userContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { format, isSameDay, parseISO } from "date-fns";
import io from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import { SERVER_URL } from "@/constants/constants";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  image_url: string | null;
  sent_at: string;
  is_read: boolean;
  tempId?: number;
  image?: string;
  profile_image?: string;
  sender_profile_pic?: string;
  receiver_profile_pic?: string;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [imageToSend, setImageToSend] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      const socket = io(`"${SERVER_URL}"`, {
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
              // Reemplazar el mensaje temporal con el real del servidor
              return prevMessages.map((msg) => {
                if (msg.tempId && msg.tempId === message.tempId) {
                  return {
                    ...message,
                    image_url: message.image_url || msg.image_url,
                  };
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
            `${SERVER_URL}/user/${user.id}/messages`
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
          setMessages(messagesData);
        } catch (error) {
          console.error("Error fetching messages:", error);
          Alert.alert("Error", "No se pudieron cargar los mensajes.");
        }
      }
    };

    fetchMessages();
  }, [user, conversationId]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = Number(item.sender_id) === Number(user?.id);
    return (
      <View
        className={`flex-row items-start my-2 ${
          isUserMessage ? "justify-end" : "justify-start"
        }`}
      >
        {!isUserMessage && (
          <Image
            source={{
              uri: item.sender_profile_pic
                ? `${SERVER_URL}${item.sender_profile_pic}`
                : "https://via.placeholder.com/40",
            }}
            className="w-8 h-8 rounded-full ml-2"
          />
        )}
        <View
          className={`p-3 rounded-lg shadow-sm ${
            isUserMessage ? "bg-blue-500 mr-3" : "bg-neutral-500 ml-3"
          } max-w-[75%]`}
        >
          {item.content ? (
            <Text className="text-white font-medium">{item.content}</Text>
          ) : null}
          {item.image_url ? (
            <TouchableOpacity
              onPress={() => {
                if (item.image_url) {
                  setSelectedImage(
                    item.image_url.startsWith("data:")
                      ? item.image_url
                      : `${SERVER_URL}${item.image_url}`
                  );
                  setModalVisible(true);
                }
              }}
            >
              <Image
                source={{
                  uri: item.image_url.startsWith("data:")
                    ? item.image_url
                    : `${SERVER_URL}${item.image_url}`,
                }}
                className="w-64 h-64 rounded-lg mt-2"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : null}
          <Text className="text-xs text-gray-200 mt-1 text-right">
            {new Date(item.sent_at).toLocaleTimeString()}
          </Text>
        </View>
        {isUserMessage && (
          <Image
            source={{
              uri: item.sender_profile_pic
                ? `${SERVER_URL}${item.sender_profile_pic}`
                : "https://via.placeholder.com/40",
            }}
            className="w-8 h-8 rounded-full mr-1"
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
    const messageContent = newMessage;
    const imageBase64 = imageToSend;
    if ((messageContent.trim() || imageBase64) && !isSending && user) {
      setIsSending(true);
      const userId = Number(user.id);
      const conversationIdNum = Number(conversationId);

      const tempId = Date.now();

      const messageData: Message = {
        id: tempId,
        sender_id: userId,
        receiver_id: conversationIdNum,
        content: messageContent,
        image_url: null,
        sent_at: new Date().toISOString(),
        is_read: false,
        tempId: tempId,
      };

      if (imageBase64) {
        messageData.image = imageBase64;
        messageData.image_url = imageBase64; // Mostrar la imagen inmediatamente
      }

      try {
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage("");
        setImageToSend(null);
        Keyboard.dismiss();

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

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permiso denegado",
        "Es necesario acceder a tus fotos para enviar imágenes."
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
    });

    if (!pickerResult.canceled) {
      const base64Image = `data:image/png;base64,${pickerResult.assets[0].base64}`;
      setImageToSend(base64Image);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
      className="flex-1 bg-white dark:bg-neutral-800"
    >
      <View className="flex-1">
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
          initialNumToRender={5}
          onContentSizeChange={() =>
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }, 50)
          }
          keyboardShouldPersistTaps="handled"
        />

        {/* Modal para mostrar la imagen en grande */}
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setModalVisible(false)}
          >
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={{ width: "90%", height: "70%" }}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </Modal>

        <View className="bottom-0 ios:mb-5 ios:p-3 border-t pt-3 android:mb-4 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-500">
          {imageToSend && (
            <View className="flex-row items-center mb-2">
              <Image
                source={{ uri: imageToSend }}
                className="w-16 h-16 rounded mr-2"
              />
              <Text className="flex-1 text-gray-700">Imagen seleccionada</Text>
              <TouchableOpacity onPress={() => setImageToSend(null)}>
                <MaterialIcons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>
          )}
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-2" onPress={handlePickImage}>
              <MaterialIcons name="attach-file" size={24} color="gray" />
            </TouchableOpacity>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity className="ml-2" onPress={handleSendMessage}>
              <MaterialIcons name="send" size={24} color={sendColor} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
