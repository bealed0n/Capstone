import { Image, RefreshControl, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text, View } from './Themed';
import PostCard from './PostCard';
import { Href, router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

interface Post {
    id: number;
    user_id: number;
    username: string;
    content: string;
    role: string;
    image: string;
    created_at: string;
}

interface UsersProfileProps {
    userId: string | string[] | undefined;  // Asegúrate que `userId` se pueda manejar como string
}

export default function UsersProfile({ userId }: UsersProfileProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [postCount, setPostCount] = useState(0); // Para contar las publicaciones
    const [followerCount, setFollowerCount] = useState(0); // Para contar los seguidores
    const [followingCount, setFollowingCount] = useState(0); // Para contar los seguidos
    const [userProfile, setUserProfile] = useState<any>(null); // Para los datos del perfil del usuario
    const photo = require('../assets/images/user.png');

    useEffect(() => {
        fetchProfileAndPosts();
        fetchUserCounts();
    }, [userId]);  // Re-fetch cuando cambia el ID del usuario

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfileAndPosts();
        await fetchUserCounts(); // Refrescar conteos también
        setRefreshing(false);
    };

    const fetchProfileAndPosts = async () => {
        if (!userId) return;

        try {
            // Obtener los datos del perfil del usuario
            const profileResponse = await fetch(`http://192.168.100.87:3000/users/${userId}`);
            if (!profileResponse.ok) {
                throw new Error('Error al obtener los datos del perfil');
            }
            const profileData = await profileResponse.json();
            setUserProfile(profileData);

            // Obtener los posts del usuario
            const postResponse = await fetch(`http://192.168.100.87:3000/posts/${userId}`);
            if (!postResponse.ok) {
                throw new Error('Error al obtener los posts');
            }
            const postData = await postResponse.json();
            setPosts(postData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCounts = async () => {
        if (!userId) return;

        try {
            // Obtener el conteo de publicaciones
            const postResponse = await fetch(`http://192.168.100.87:3000/posts/count/${userId}`);
            const postData = await postResponse.json();
            setPostCount(postData.post_count);

            // Obtener el conteo de seguidores
            const followerResponse = await fetch(`http://192.168.100.87:3000/followers/${userId}`);
            const followerData = await followerResponse.json();
            setFollowerCount(followerData.follower_count);

            // Obtener el conteo de seguidos
            const followingResponse = await fetch(`http://192.168.100.87:3000/following/${userId}`);
            const followingData = await followingResponse.json();
            setFollowingCount(followingData.following_count);
        } catch (error) {
            console.error(error);
        }
    };
    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';

    const renderHeader = () => (
        <View>
            <View className="flex-row">
                <Image source={photo} className='rounded-full w-20 h-20 items-start mt-4 ml-3' />
                <View className="flex-col ml-3 mt-4">
                    <Text className='text-xl font-bold'>{userProfile?.username ?? 'No encontrado'}</Text>
                    <View className='flex-row'>
                        <Text className='text-sm mt-1'>{postCount} Posts</Text>
                        <Text className='text-sm mt-1 ml-3'>{followerCount} Followers</Text>
                        <Text className='text-sm mt-1 ml-3'>{followingCount} Following</Text>
                    </View>
                </View>
            </View>

            <View className="mt-4 h-0.5 border-t-0 bg-neutral-200 dark:bg-white/10" />

            {userProfile?.role === 'tattoo_artist' && (
                <View className='mb-3'>
                    <View className='flex-row justify-center mt-2'>
                        <TouchableOpacity className='flex-1 mx-5'
                            onPress={() => {
                                console.log('Ir a fechas disponibles');
                            }}
                        >
                            <View className='flex-row items-center justify-center bg-gray-200 dark:bg-zinc-700 rounded-md p-3'>
                                <FontAwesome5
                                    name="clock"
                                    size={20}
                                    color={iconColor}
                                    style={{ marginRight: 8 }} // Aplicar margen derecho en línea
                                    className='dark:text-white'
                                />
                                <Text className='text-base text-black text-center dark:text-white font-semibold'>
                                    Avaible dates
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <FlatList
            data={posts}
            renderItem={({ item }) => <PostCard post={item} />}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
    );
}