import React, { useState } from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import tailwind from 'twrnc';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';


interface CardExampleProps {
    username: string;
    content: string;
    image: string;
    createdAt: string;
}

interface Post {
    username: string;
    content: string;
    image: string;
    created_at: string;
}

const SERVER_URL = 'http://192.168.100.87:3000'; // Cambia esto a la URL de tu servidor
const { width: SCREEN_WIDTH } = Dimensions.get('window'); // Obtener el ancho de la pantalla

export const CardExample = ({ username, content, image, createdAt }: CardExampleProps) => {
    const [isExpanded, setIsExpanded] = useState(false); // Estado para controlar si el texto está expandido
    const imageUrl = image ? `${SERVER_URL}${image}` : null;
    const timeAgo = formatDistanceToNow(parseISO(createdAt), { addSuffix: true });

    return (
        <View className='w-full bg-neutral-200 dark:bg-neutral-900 mb-1 overflow-hidden'>
            {/* Header con Avatar, Username y Fecha */}
            <View className="flex-row items-center p-3">
                <Image
                    source={require('@/assets/images/user.png')}
                    className='w-11 h-11 rounded-full mr-3'
                />
                <View>
                    <Text className='text-base font-bold dark:text-white'>@{username}</Text>
                    <Text className='text-xs text-gray-500'>{timeAgo}</Text>

                </View>
            </View>
            {/* Contenido del Post */}
            <View className='px-2 pb-1'>
                <Text
                    className='text-base text-black dark:text-white'
                    numberOfLines={isExpanded ? undefined : 2} // Mostrar solo 2 líneas cuando no esté expandido
                >
                    {content}
                </Text>

                {/* Botón "Show more" o "Show less" si el contenido es largo */}
                {content.length > 60 && (
                    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                        <Text className='text-neutral-600'>
                            {isExpanded ? 'Show less' : 'Show more'}
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

                <TouchableOpacity className="flex-row items-center">
                    <MaterialIcons name="favorite-outline" size={24} color="gray" />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center mx-16">
                    <MaterialIcons name="add-comment" size={24} color="gray" />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center">
                    <MaterialIcons name="ios-share" size={24} color="gray" />
                </TouchableOpacity>

            </View>


        </View>
    );
};

export default function PostCard({ post }: { post: Post }) {
    return (
        <CardExample
            username={post.username}
            content={post.content}
            image={post.image}
            createdAt={post.created_at}
        />
    );
}
