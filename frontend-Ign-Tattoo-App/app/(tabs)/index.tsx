import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router"; // Hook para redirección
import PostCard from "@/components/PostCard";
import { UserContext } from "../context/userContext";

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
  const { isLoggedIn } = useContext(UserContext); // Aseguramos que solo cargue si está logueado
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [layoutMounted, setLayoutMounted] = useState(false); // Estado para verificar si el layout está montado
  const router = useRouter(); // Hook para redirección

  useEffect(() => {
    // Este hook simula el montaje del layout
    setTimeout(() => setLayoutMounted(true), 0); // Espera un ciclo de render para asegurar el montaje
  }, []);

  useEffect(() => {
    if (layoutMounted) {
      if (!isLoggedIn) {
        // Si no está logueado, redirigimos al login
        router.replace("/(auth)/login");
      } else {
        // Si está logueado, obtenemos los posts
        fetchPosts();
      }
    }
  }, [isLoggedIn, layoutMounted]);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://192.168.100.87:3000/posts");
      if (!response.ok) {
        throw new Error("Error al obtener los posts");
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

  if (!layoutMounted) {
    // No mostramos nada mientras el layout no esté montado
    return null;
  }

  if (!isLoggedIn) {
    // Si el usuario no está logueado, no mostramos nada (aunque la redirección ya debería estar en marcha)
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
