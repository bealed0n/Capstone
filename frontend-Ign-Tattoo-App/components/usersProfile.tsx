import React, { useState, useEffect, useContext } from "react";
import {
  Image,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, View } from "./Themed";
import PostCard from "./PostCard";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserContext } from "../app/context/userContext";

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

interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  bio: string;
  role: string;
  profile_pic: string;
}

interface UsersProfileProps {
  userId: string | string[] | undefined;
}

export default function UsersProfile({ userId }: UsersProfileProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const { user } = useContext(UserContext);
  const SERVER_URL = "http://192.168.100.87:3000";
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isDark = isDarkMode ? "white" : "black";

  useEffect(() => {
    if (userId) {
      fetchProfileAndPosts();
      fetchUserCounts();
      checkIfFollowing();
    }
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileAndPosts();
    await fetchUserCounts();
    await checkIfFollowing();
    setRefreshing(false);
  };

  const fetchProfileAndPosts = async () => {
    if (!userId) return;

    try {
      // Obtener los datos del perfil del usuario
      const profileResponse = await fetch(`${SERVER_URL}/users/${userId}`);
      if (!profileResponse.ok) {
        throw new Error("Error al obtener los datos del perfil");
      }
      const profileData = await profileResponse.json();
      setUserProfile(profileData);

      // Obtener los posts del usuario
      const postResponse = await fetch(`${SERVER_URL}/posts/${userId}`);
      if (!postResponse.ok) {
        throw new Error("Error al obtener los posts");
      }
      const postData = await postResponse.json();
      setPosts(postData);
      setPostCount(postData.length);
    } catch (error) {
      console.error("Error fetching profile and posts:", error);
      Alert.alert("Error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCounts = async () => {
    try {
      // Obtener el conteo de seguidores
      const followersResponse = await fetch(
        `${SERVER_URL}/followers/${userId}`
      );
      if (!followersResponse.ok) {
        throw new Error(
          `Error al obtener seguidores: ${followersResponse.status}`
        );
      }
      const followersData = await followersResponse.json();
      setFollowerCount(followersData.follower_count);

      // Obtener el conteo de seguidos
      const followingResponse = await fetch(
        `${SERVER_URL}/following/${userId}`
      );
      if (!followingResponse.ok) {
        throw new Error(
          `Error al obtener seguidos: ${followingResponse.status}`
        );
      }
      const followingData = await followingResponse.json();
      setFollowingCount(followingData.following_count);

      // Obtener el conteo de posts
      const postsResponse = await fetch(`${SERVER_URL}/posts/count/${userId}`);
      if (!postsResponse.ok) {
        throw new Error(`Error al obtener posts: ${postsResponse.status}`);
      }
      const postsData = await postsResponse.json();
      setPostCount(postsData.post_count);
    } catch (error) {
      console.error("Error fetching user counts:", error);
      Alert.alert("Error", (error as Error).message);
    }
  };

  const checkIfFollowing = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/isFollowing?follower_id=${user?.id}&following_id=${userId}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al verificar seguimiento: ${response.status} - ${errorText}`
        );
      }
      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          follower_id: user?.id,
          following_id: Number(userId),
        }),
      });

      if (response.ok) {
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      } else {
        const errorText = await response.text();
        throw new Error(
          `Error al seguir al usuario: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          follower_id: user?.id,
          following_id: Number(userId),
        }),
      });

      if (response.ok) {
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
      } else {
        const errorText = await response.text();
        throw new Error(
          `Error al dejar de seguir al usuario: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      Alert.alert("Error", (error as Error).message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center">
              <Image
                source={
                  userProfile?.profile_pic
                    ? { uri: `${SERVER_URL}${userProfile.profile_pic}` }
                    : require("../assets/images/user.png")
                }
                className="w-24 h-24 rounded-full"
              />
              <View className="ml-4">
                <Text className="text-xl font-bold">{userProfile?.name}</Text>
                <Text className="text-sm mb-1">@{userProfile?.username}</Text>

                <Text className="mt-2 text-gray-500">Biografia</Text>

                <Text className="ml-1">{userProfile?.bio}</Text>
              </View>
            </View>

            {/* Contadores de publicaciones, seguidores y seguidos */}
            <View className="flex-row justify-around mt-4 mr-3">
              <View className="items-center">
                <Text className="font-bold">{postCount}</Text>
                <Text>Publicaciones</Text>
              </View>
              <View className="items-center">
                <Text className="font-bold">{followerCount}</Text>
                <Text>Seguidores</Text>
              </View>
              <View className="items-center">
                <Text className="font-bold">{followingCount}</Text>
                <Text>Seguidos</Text>
              </View>
            </View>

            {/* Botón de Seguir/Dejar de seguir */}
            {user && user.id !== Number(userId) && (
              <TouchableOpacity
                onPress={isFollowing ? handleUnfollow : handleFollow}
                className={`mt-4 py-2 px-4 rounded ${
                  isFollowing ? "bg-gray-300" : "bg-blue-500"
                }`}
              >
                <Text
                  className={`text-center ${
                    isFollowing ? "text-black" : "text-white"
                  }`}
                >
                  {isFollowing ? "Dejar de seguir" : "Seguir"}
                </Text>
              </TouchableOpacity>
            )}

            <Text className="mt-6 text-lg font-bold">Publicaciones</Text>
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <FontAwesome5 name="frown" size={50} color="gray" />
            <Text className="mt-4 text-lg text-gray-500">
              No hay publicaciones aún
            </Text>
          </View>
        )}
      />
    </View>
  );
}
