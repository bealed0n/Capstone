import { Image, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { Text, View } from './Themed';
import { UserContext } from '@/app/context/userContext';
import { Href, router } from 'expo-router';
import PostCard from './PostCard';

interface Post {
    id: number;
    user_id: number;
    username: string;
    content: string;
    role: string;
    image: string;
    created_at: string;
}

export default function Profile() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [postCount, setPostCount] = useState(0); // Para contar las publicaciones
    const [followerCount, setFollowerCount] = useState(0); // Para contar los seguidores
    const [followingCount, setFollowingCount] = useState(0); // Para contar los seguidos
    const { user } = useContext(UserContext);
    const photo = require('../assets/images/user.png');

    useEffect(() => {
        fetchPosts();
        fetchUserCounts();
    }, [user?.id]); // Re-fetch posts and counts when user ID changes

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
        await fetchUserCounts(); // Refrescar conteos también
        setRefreshing(false);
    };

    const fetchPosts = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`http://192.168.100.87:3000/posts/${user.id}`);
            if (!response.ok) {
                throw new Error('Error al obtener los posts');
            }
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCounts = async () => {
        if (!user?.id) return;

        try {
            // Obtener el conteo de publicaciones
            const postResponse = await fetch(`http://192.168.100.87:3000/posts/count/${user.id}`);
            const postData = await postResponse.json();
            setPostCount(postData.post_count);

            // Obtener el conteo de seguidores
            const followerResponse = await fetch(`http://192.168.100.87:3000/followers/${user.id}`);
            const followerData = await followerResponse.json();
            setFollowerCount(followerData.follower_count);

            // Obtener el conteo de seguidos
            const followingResponse = await fetch(`http://192.168.100.87:3000/following/${user.id}`);
            const followingData = await followingResponse.json();
            setFollowingCount(followingData.following_count);
        } catch (error) {
            console.error(error);
        }
    };

    const renderHeader = () => (
        <View>
            <View className="flex-row">
                <Image source={photo} className='rounded-full w-20 h-20 items-start mt-4 ml-3' />
                <View className="flex-col ml-3 mt-4">
                    <Text className='text-xl font-bold'>{user?.username ?? 'No encontrado'}</Text>
                    <View className='flex-row'>
                        <Text className='text-sm mt-1'>{postCount} Posts</Text>
                        <Text className='text-sm mt-1 ml-3'>{followerCount} Followers</Text>
                        <Text className='text-sm mt-1 ml-3'>{followingCount} Following</Text>
                    </View>
                </View>
            </View>
            <View>
                <Text className='text-base mt-4 ml-5 opacity-50'>Dashboard</Text>
                <View className='flex-row justify-center mt-2'>
                    <TouchableOpacity className='flex-1 mx-5'
                        onPress={() => {
                            router.push('/(managment)/calendar' as Href);
                        }}
                    >
                        <Text className='text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md'>
                            Calendar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className='flex-1 mx-5'
                        onPress={() => {
                            router.push('/(managment)/apointmentList' as Href);
                        }}
                    >
                        <Text className='text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md'>
                            Appointments
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="mt-4 h-0.5 border-t-0 bg-neutral-200 dark:bg-white/10" />
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
