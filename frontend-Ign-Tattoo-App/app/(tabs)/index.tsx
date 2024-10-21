import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';  // Asegúrate de importar el hook para redirección
import PostCard from '@/components/PostCard';
import { UserContext } from '../context/userContext';

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  role: string;
  image: string;
  created_at: string;
}

export default function IndexScreen() {
  const { isLoggedIn, loading } = useContext(UserContext);  // Aseguramos que solo cargue si está logueado
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();  // Hook para redirección

  useEffect(() => {
    if (loading) return; // Espera a que termine la verificación de carga

    if (!isLoggedIn) {
      // Si no está logueado, mostrar un aviso y redirigir al login después de 3 segundos
      alert('Debes iniciar sesión para ver las publicaciones.');
      const timeoutId = setTimeout(() => {
        router.push('/(auth)/login');  // Redirigir al login
      }, 3000);
      return () => clearTimeout(timeoutId);  // Limpiar timeout si cambia el estado o se desmonta el componente
    } else {
      fetchPosts();  // Solo hacer la llamada si está logueado
    }
  }, [isLoggedIn, loading, router]);  // Añadir 'loading' a las dependencias

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
      setLoadingPosts(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Post }) => <PostCard post={item} />;

  // Mostrar "Cargando..." mientras se verifica el estado de sesión o mientras cargan los posts
  if (loading || loadingPosts) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
