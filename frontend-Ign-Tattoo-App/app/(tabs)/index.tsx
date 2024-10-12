import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Text, FlatList, RefreshControl } from 'react-native';
import PostCard from '@/components/PostCard';

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  image: string;
  created_at: string;
}

export default function IndexScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://192.168.100.87:3000/posts');
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Post }) => <PostCard post={item} />;

  return (
    <SafeAreaView className='flex-1 items-center'>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}