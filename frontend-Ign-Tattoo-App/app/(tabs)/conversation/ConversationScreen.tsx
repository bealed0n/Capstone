import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { UserContext } from '@/app/context/userContext';
import { styled } from 'nativewind';

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
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { conversationId } = route.params;
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (user) {
                try {
                    const response = await fetch(`http://192.168.100.87:3000/user/${user.id}/messages`);
                    const data: { messages: Message[] } = await response.json();

                    // Filtrar los mensajes
                    const messagesData = data.messages.filter((message: Message) =>
                        (message.receiver_id === Number(user.id) && message.sender_id === Number(conversationId)) ||
                        (message.sender_id === Number(user.id) && message.receiver_id === Number(conversationId))
                    );

                    setMessages(messagesData);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();
    }, [user, conversationId]);

    return (
        <View className="flex-1 p-4 bg-white">
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const isUserMessage = item.sender_id === user.id;
                    return (
                        <View
                            className={`flex-row items-start my-2 ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isUserMessage && (
                                <StyledImage
                                    source={require('@/assets/images/user.png')}
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                            )}
                            <View
                                className={`p-3 rounded-lg shadow-sm ${isUserMessage ? 'bg-blue-500 mr-3' : 'bg-gray-200 ml-3'} max-w-[75%]`}
                            >
                                <Text
                                    className={`${isUserMessage ? 'text-white' : 'text-black'} font-medium`}
                                    style={{ flexWrap: 'wrap', lineHeight: 20 }} // Permite que el texto ocupe varias líneas y establece un alto de línea adecuado
                                >
                                    {item.content}
                                </Text>
                                <Text className="text-xs text-gray-500 mt-1 text-right">
                                    {new Date(item.sent_at).toLocaleTimeString()}
                                </Text>
                            </View>
                            {isUserMessage && (
                                <StyledImage
                                    source={require('@/assets/images/user.png')}
                                    className="w-8 h-8 rounded-full ml-2"
                                />
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
}
