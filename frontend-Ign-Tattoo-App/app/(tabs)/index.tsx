import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import PostCard from "@/components/PostCard";
import { UserContext } from "../context/userContext";
import { View } from "@/components/Themed";
import { SERVER_URL } from "@/constants/constants";

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  role: string;
  image: string;
  created_at: string;
  profile_pic: string;
}

export default function IndexScreen() {
  const { isLoggedIn, user } = useContext(UserContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [layoutMounted, setLayoutMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setLayoutMounted(true), 0);
  }, []);

  useEffect(() => {
    if (layoutMounted) {
      if (!isLoggedIn) {
        router.replace("/(auth)/login");
      } else {
        fetchPosts();
      }
    }
  }, [isLoggedIn, layoutMounted]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/posts/following/${user.id}`);
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handlePostDelete = (deletedPostId: number) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== deletedPostId)
    );
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onUpdate={handlePostUpdate}
      onDelete={handlePostDelete}
      isOwner={user?.id === item.user_id}
    />
  );

  if (!layoutMounted) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Text>Cargando posts...</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center p-4 bg-transparent">
              <Text className="text-lg text-center text-gray-800 dark:text-white mb-4">
                No sigues a nadie aún. 😞
              </Text>
              {/*Divider*/}
              <View className="h-0.5 bg-gray-300 dark:bg-white/10 w-full mb-4" />
              <Text className="text-lg text-center text-gray-800 dark:text-white mb-">
                Sigue a otros usuarios para ver sus publicaciones aquí.🖤
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
