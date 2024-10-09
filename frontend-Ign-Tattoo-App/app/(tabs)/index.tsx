import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, FlatList } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import PostCard from '@/components/PostCard';
import RefreshControlComp from '@/components/RefreshControl';

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

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard post={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <RefreshControlComp>
        <View style={styles.content}>
          {loading ? (
            <Text>Cargando...</Text>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
          <View style={styles.separator} />
        </View>
      </RefreshControlComp>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});