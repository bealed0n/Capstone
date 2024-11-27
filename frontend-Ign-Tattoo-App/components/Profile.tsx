import {
  Image,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  useColorScheme,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { Text, View } from "./Themed";
import { UserContext } from "../app/context/userContext";
import { Href, router } from "expo-router";
import PostCard from "./PostCard";
import { FontAwesome5 } from "@expo/vector-icons";
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

interface UserData {
  id: number;
  name: string;
  bio: string | null;
  username: string;
  profile_pic: string | null;
  role: string;
}

export default function Profile() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postCount, setPostCount] = useState(0); // Para contar las publicaciones
  const [followerCount, setFollowerCount] = useState(0); // Para contar los seguidores
  const [followingCount, setFollowingCount] = useState(0); // Para contar los seguidos
  const { user } = useContext(UserContext);
  const photo = require("../assets/images/user.png");

  useEffect(() => {
    fetchPosts();
    fetchUserCounts();
    fetchUserData();
  }, [user?.id]); // Re-fetch posts and counts when user ID changes

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    await fetchUserCounts(); // Refrescar conteos también
    await fetchUserData(); // Refrescar datos del usuario
    setRefreshing(false);
  };

  const defaultPhoto = require("../assets/images/user.png");

  const fetchPosts = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${SERVER_URL}/posts/${user.id}`);
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

  const fetchUserCounts = async () => {
    if (!user?.id) return;

    try {
      // Obtener el conteo de publicaciones
      const postResponse = await fetch(`${SERVER_URL}/posts/count/${user.id}`);
      const postData = await postResponse.json();
      setPostCount(postData.post_count);

      // Obtener el conteo de seguidores
      const followerResponse = await fetch(
        `${SERVER_URL}/followers/${user.id}`
      );
      const followerData = await followerResponse.json();
      setFollowerCount(followerData.follower_count);

      // Obtener el conteo de seguidos
      const followingResponse = await fetch(
        `${SERVER_URL}/following/${user.id}`
      );
      const followingData = await followingResponse.json();
      setFollowingCount(followingData.following_count);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/users/${user?.id}`);
      if (!response.ok) {
        throw new Error("Error al obtener los datos del usuario");
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";

  const renderHeader = () => (
    <View>
      <View className="flex-row">
        {/* Mostrar la foto de perfil del usuario si no mostrar foto default */}

        <Image
          source={
            userData?.profile_pic
              ? { uri: `${SERVER_URL}${userData.profile_pic}` }
              : defaultPhoto
          }
          className="rounded-full w-20 h-20 items-start mt-4 ml-3"
        />
        <View className="flex-col ml-3 mt-4">
          <Text className="text-2xl font-bold mb-1">
            {userData?.name ?? "No encontrado"}
          </Text>

          <Text className="text-sm ml-2 mb-2">
            @{userData?.username ?? "No encontrado"}
          </Text>
          <View className="flex-row">
            <Text className="text-sm mt-1">{postCount} Public.</Text>
            <Text className="text-sm mt-1 ml-3">
              {followerCount} Seguidores
            </Text>
            <Text className="text-sm mt-1 ml-3">
              {followingCount} Seguiendo
            </Text>
          </View>
        </View>
      </View>
      <View>
        <Text className="text-base mt-4 ml-5 opacity-50">Biografia</Text>
        <Text className=" ml-6 text-neutral-700 dark:text-neutral-300 ">
          {userData?.bio ?? "No se ha agregado una biografía"}
        </Text>
      </View>
      <View>
        <Text className="text-base mt-4 ml-5 opacity-50">Dashboard</Text>
        <View className="flex-row justify-center mt-2">
          {userData?.role === "tattoo_artist" ? (
            <TouchableOpacity
              className="flex-1 mx-5 "
              onPress={() => {
                router.push("/management/calendar" as Href);
              }}
            >
              <View className="flex-row items-center justify-center p-3 bg-yellow-600 rounded-md">
                <FontAwesome5
                  name="calendar-alt"
                  size={20}
                  color={"white"}
                  style={{ marginRight: 8 }} // Aplicar margen derecho en línea
                  className="dark:text-white"
                />
                <Text className="text-base text-white text-center font-semibold">
                  Calendario
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 mx-5"
              onPress={() => {
                router.push("/designer/requestedDesigns" as Href);
              }}
            >
              <View className="flex-row items-center justify-center bg-indigo-500 rounded-md p-3 ">
                <FontAwesome5
                  name="comment-dots"
                  size={20}
                  color={"white"}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-base text-white text-center  font-semibold">
                  Proyectos Sol.
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {userData?.role === "tattoo_artist" ? (
            <TouchableOpacity
              className="flex-1 mx-5"
              onPress={() => {
                router.push("/management/apointmentList" as Href);
              }}
            >
              <View className="flex-row items-center justify-center  bg-yellow-600 rounded-md p-3">
                <FontAwesome5
                  name="tasks"
                  size={20}
                  color={"white"}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-base text-white text-center font-semibold">
                  Citas
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 mx-5"
              onPress={() => {
                router.push("/designer/designerProjects" as Href);
              }}
            >
              <View className="flex-row items-center justify-center bg-indigo-500 rounded-md p-3">
                <FontAwesome5
                  name="tasks"
                  size={20}
                  color={"white"}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-base text-white text-center font-semibold">
                  Mis proyectos
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View className="mt-4 h-0.5 border-t-0 bg-neutral-200 dark:bg-white/10" />
    </View>
  );

  return (
    <FlatList
      data={posts}
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
          }}
          isOwner={item.user_id === userData?.id}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={renderHeader}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center mt-4">
          <Text className="text-lg">No has realizado publicaciones aun</Text>
        </View>
      }
    />
  );
}
