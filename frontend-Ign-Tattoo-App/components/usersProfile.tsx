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
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { UserContext } from "../app/context/userContext";
import { useRouter } from "expo-router";
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
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const { user } = useContext(UserContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isDark = isDarkMode ? "white" : "black";
  const router = useRouter();

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
      const profileResponse = await fetch(`${SERVER_URL}/users/${userId}`);
      if (!profileResponse.ok) {
        throw new Error("Error al obtener los datos del perfil");
      }
      const profileData = await profileResponse.json();
      setUserProfile(profileData);

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
      const followersResponse = await fetch(
        `${SERVER_URL}/followers/${userId}`
      );
      if (!followersResponse.ok) {
        throw new Error(
          `Error al obtener seguidores: ${followersResponse.status}`
        );
      }
      const followersData = await followersResponse.json();
      setFollowerCount(Number(followersData.follower_count));

      const followingResponse = await fetch(
        `${SERVER_URL}/following/${userId}`
      );
      if (!followingResponse.ok) {
        throw new Error(
          `Error al obtener seguidos: ${followingResponse.status}`
        );
      }
      const followingData = await followingResponse.json();
      setFollowingCount(Number(followingData.following_count));

      const postsResponse = await fetch(`${SERVER_URL}/posts/count/${userId}`);
      if (!postsResponse.ok) {
        throw new Error(`Error al obtener posts: ${postsResponse.status}`);
      }
      const postsData = await postsResponse.json();
      setPostCount(Number(postsData.post_count));
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

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        setIsFollowing(false);
        setFollowerCount((prevCount) => prevCount - 1);
        await unfollowUser();
      } else {
        setIsFollowing(true);
        setFollowerCount((prevCount) => prevCount + 1);
        await followUser();
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
    }
  };

  const followUser = async () => {
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

      if (!response.ok) {
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

  const unfollowUser = async () => {
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

      if (!response.ok) {
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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-neutral-900">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View className="bg-white dark:bg-neutral-900 p-4 rounded-b-3xl shadow-md">
            <View className="flex-row items-center dark:bg-neutral-900">
              <Image
                source={
                  userProfile?.profile_pic
                    ? { uri: `${SERVER_URL}${userProfile.profile_pic}` }
                    : require("../assets/images/user.png")
                }
                className="w-24 h-24 rounded-full"
              />
              <View className="ml-4 flex-1 dark:bg-neutral-900">
                <Text className="text-xl font-bold text-gray-800 dark:text-white">
                  {userProfile?.name}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  @{userProfile?.username}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 mt-2">
                  {userProfile?.bio}
                </Text>
              </View>
            </View>

            {userProfile?.role === "tattoo_artist" && (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: `/reviews/reviewsView`,
                    params: { userId: userId },
                  })
                }
                className="absolute right-2.5 top-2.5 bg-yellow-400 px-2 py-0.5 rounded p"
              >
                <View className="flex-row items-center justify-center bg-yellow-400">
                  <MaterialIcons name="star" size={24} color="black" />
                  <Text className="text-black font-bold">Reseñas</Text>
                </View>
              </TouchableOpacity>
            )}

            <View className="flex-row justify-around mt-6 bg-gray-200 dark:bg-neutral-700 rounded-full py-2">
              <View className="items-center bg-gray-200 dark:bg-neutral-700 ">
                <Text className="font-bold text-gray-800 dark:text-white">
                  {postCount}
                </Text>
                <Text className="text-gray-600 dark:text-gray-300">Public</Text>
              </View>
              <View className="items-center bg-gray-200 dark:bg-neutral-700">
                <Text className="font-bold text-gray-800 dark:text-white">
                  {followerCount}
                </Text>
                <Text className="text-gray-600 dark:text-gray-300">
                  Seguidores
                </Text>
              </View>
              <View className="items-center bg-gray-200 dark:bg-neutral-700">
                <Text className="font-bold text-gray-800 dark:text-white">
                  {followingCount}
                </Text>
                <Text className="text-gray-600 dark:text-gray-300">
                  Siguiendo
                </Text>
              </View>
            </View>
            {user && user.id !== Number(userId) && (
              <TouchableOpacity
                onPress={handleFollowToggle}
                className={`mt-4 py-2 px-4 rounded-full ${
                  isFollowing ? "bg-gray-300 dark:bg-gray-600" : "bg-blue-500"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    isFollowing ? "text-gray-800 dark:text-white" : "text-white"
                  }`}
                >
                  {isFollowing ? "Dejar de seguir" : "Seguir"}
                </Text>
              </TouchableOpacity>
            )}
            {userProfile?.role === "tattoo_artist" && (
              <View className="mt-4 dark:bg-neutral-900">
                <TouchableOpacity
                  className="bg-yellow-600 py-2 px-4 rounded-full flex-row items-center justify-center"
                  onPress={() => {
                    if (
                      user?.role === "tattoo_artist" ||
                      user?.role === "Designer"
                    ) {
                      Alert.alert(
                        "Para acceder a las citas disponibles debes ser un usuario común"
                      );
                    } else {
                      router.push({
                        pathname: "/management/availableDates",
                        params: { id: userId },
                      });
                    }
                  }}
                >
                  <FontAwesome5
                    name="clock"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-semibold">
                    Citas disponibles
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {userProfile?.role === "Designer" && (
              <View className="mt-4 dark:bg-neutral-900">
                <TouchableOpacity
                  className="bg-indigo-500 py-2 px-4 rounded-full flex-row items-center justify-center"
                  onPress={() => {
                    if (
                      user?.role === "tattoo_artist" ||
                      user?.role === "Designer"
                    ) {
                      Alert.alert(
                        "Solo los usuarios comunes pueden acceder a las citas disponibles"
                      );
                    } else {
                      router.push({
                        pathname: "/designer/availableDesigns",
                        params: { id: userId },
                      });
                    }
                  }}
                >
                  <FontAwesome5
                    name="paint-brush"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-semibold">
                    Diseños disponibles
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <Text className="mt-6 text-lg font-bold text-gray-800 dark:text-white">
              Publicaciones
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onUpdate={(updatedPost) => {
              setPosts((prevPosts) =>
                prevPosts.map((post) =>
                  post.id === updatedPost.id ? updatedPost : post
                )
              );
            }}
            onDelete={(deletedPostId) => {
              setPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== deletedPostId)
              );
              setPostCount((prevCount) => prevCount - 1);
            }}
            isOwner={user?.id === item.user_id}
          />
        )}
        ListEmptyComponent={() => (
          <View className="items-center mt-20 bg-transparent">
            <FontAwesome5 name="frown" size={50} color="gray" />
            <Text className="mt-4 text-lg text-gray-500">No posts yet</Text>
          </View>
        )}
      />
    </View>
  );
}
