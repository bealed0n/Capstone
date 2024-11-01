import React, { useContext, useEffect, useState, useRef } from 'react';
import { FlatList, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRoute, RouteProp } from '@react-navigation/native';
import { UserContext } from '@/app/context/userContext';
import { styled } from 'nativewind';

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

interface RouteParams {
    conversationId: number;
}

export default function ConversationScreen() {
    const { user } = useContext(UserContext);
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { conversationId } = route.params;
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationUser, setConversationUser] = useState<string>('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (user) {
                try {
                    const response = await fetch(`http://192.168.100.87:3000/user/${user.id}/messages`);
                    const data: { messages: Message[] } = await response.json();

                    const messagesData = data.messages.filter((message: Message) =>
                        (message.receiver_id === Number(user.id) && message.sender_id === Number(conversationId)) ||
                        (message.sender_id === Number(user.id) && message.receiver_id === Number(conversationId))
                    );

                    setMessages(messagesData);

                    // sender username




                    if (messagesData.length > 0) {
                        const firstMessage = messagesData[0];
                        const username = firstMessage.sender_id === user.id ? firstMessage.receiver_username : firstMessage.sender_username;

                        console.log("Nombre de usuario dse la conversación:", username);
                        setConversationUser(username);
                    }

                    setTimeout(() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();
    }, [user, conversationId]);

    return (
        <View className="flex-1 p-4">
            {/* Contenedor con margen personalizado para colocar el nombre de usuario justo debajo del header */}
            <View className="mb-1 bg-neutral-200 dark:bg-neutral-500 rounded-lg">
                <Text className="text-lg font-bold text-center">{conversationUser}</Text>
            </View>

            <FlatList
                ref={flatListRef}
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
                                className={`p-3 rounded-lg shadow-sm ${isUserMessage ? 'bg-blue-500 mr-3' : 'bg-gray-200 dark:bg-neutral-800 ml-3'} max-w-[75%]`}
                            >
                                <Text
                                    className={`${isUserMessage ? 'text-white' : 'text-black dark:text-white'} font-medium`}
                                    style={{ flexWrap: 'wrap', lineHeight: 20 }}
                                >
                                    {item.content}
                                </Text>
                                <Text
                                    className={`text-xs ${isUserMessage ? 'text-neutral-200' : 'text-neutral-500 dark:text-neutral-400'} mt-1 text-right`}
                                >
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
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
        </View>
    );
}