import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
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

interface Conversation {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    image_url: string | null;
    sent_at: string;
    is_read: boolean;
}

export default function Messages() {
    const { user } = useContext(UserContext);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchConversations = async () => {
            if (user) {
                try {
                    const response = await fetch(`http://192.168.100.87:3000/user/${user.id}/conversations`);
                    const data = await response.json();
                    setConversations(data.conversations);
                } catch (error) {
                    console.error('Error fetching conversations:', error);
                }
            }
        };

        fetchConversations();
    }, [user]);

    return (
        <View>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => {
                        console.log("Redirecting to conversation with ID:", item.sender_id === user.id ? item.receiver_id : item.sender_id);
                        router.push({
                            pathname: '/(tabs)/conversation/ConversationScreen',
                            params: { conversationId: item.sender_id === user.id ? item.receiver_id : item.sender_id }
                        });
                    }}>

                        <View className="flex-row p-2 mx-3 my-2 shadow-lg mb-4 rounded-lg">
                            <StyledImage
                                source={require('@/assets/images/user.png')}
                                className="w-10 h-10 rounded-full mr-4"
                            />
                            <View className="flex-1">
                                <Text className="font-bold mb-1">User {item.sender_id === user.id ? item.receiver_id : item.sender_id}</Text>
                                <Text className="mb-1">{item.content}</Text>
                                <Text className="text-xs text-gray-500">{new Date(item.sent_at).toLocaleString()}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}