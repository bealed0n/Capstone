import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { Href, router } from "expo-router";
import debounce from "lodash.debounce";
import { SERVER_URL } from "@/constants/constants";

interface User {
  id: number;
  username: string;
  profile_pic: string | null;
  role: string;
}

interface TattooStudio {
  id: number;
  name: string;
  image_url: string | null;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [tattooStudios, setTattooStudios] = useState<TattooStudio[]>([]);
  const [tattooArtists, setTattooArtists] = useState<User[]>([]);
  const [designers, setDesigners] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";

  const fetchData = useCallback(async () => {
    try {
      const [studiosRes, artistsRes, designersRes] = await Promise.all([
        fetch(`${SERVER_URL}/tattoo-studios`),
        fetch(`${SERVER_URL}/tattoo-artist/random`),
        fetch(`${SERVER_URL}/designer/random`),
      ]);

      const studiosData = await studiosRes.json();
      const artistsData = await artistsRes.json();
      const designersData = await designersRes.json();

      setTattooStudios(studiosData);
      setTattooArtists(artistsData.tattoo_artists);
      setDesigners(designersData.designers);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const fetchUsers = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setUsers([]);
        setNoResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${SERVER_URL}/search/users?query=${query}`
        );
        const data = await response.json();
        setUsers(data.users);
        setNoResults(data.users.length === 0);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchUsers(searchQuery);
  }, [searchQuery, fetchUsers]);

  const beautifyRole = (role: string) => {
    switch (role) {
      case "tattoo_artist":
        return "Tatuador";
      case "Designer":
        return "Diseñador";
      default:
        return role;
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/user/${item.id}` as Href)}
      className="flex-row items-center p-3 border-b border-gray-200 dark:border-gray-700"
    >
      <Image
        source={
          item.profile_pic
            ? { uri: `${SERVER_URL}${item.profile_pic}` }
            : require("../assets/images/user.png")
        }
        className="w-12 h-12 rounded-full mr-3"
      />
      <View>
        <Text className="text-base font-semibold dark:text-white">
          @{item.username}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {beautifyRole(item.role)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStudioItem = ({ item }: { item: TattooStudio }) => (
    <TouchableOpacity
      className="mr-4"
      onPress={() => router.push(`/studio/${item.id}` as Href)}
    >
      <View className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
        <Image
          source={
            item.image_url
              ? { uri: `${SERVER_URL}${item.image_url}` }
              : require("../assets/images/user.png")
          }
          className="w-full h-full"
        />
      </View>
      <Text className="mt-2 text-center text-sm font-semibold dark:text-white">
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (searchQuery) {
      return (
        <>
          {loading && (
            <ActivityIndicator
              size="large"
              color={iconColor}
              className="my-4"
            />
          )}

          {!loading && noResults && (
            <Text className="text-center text-gray-500 mt-4">
              No se encontraron usuarios.
            </Text>
          )}

          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={
              !loading && noResults ? (
                <Text className="text-center text-gray-500 mt-4">
                  No se encontraron usuarios.
                </Text>
              ) : null
            }
          />
        </>
      );
    }

    return (
      <>
        <Text className="text-xl font-bold mb-4 text-center dark:text-white">
          Descubre
        </Text>

        <Text className="text-lg font-semibold mb-2 dark:text-white">
          Estudios de Tatuajes
        </Text>
        <FlatList
          data={tattooStudios}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderStudioItem}
          className="mb-6"
        />

        <Text className="text-lg font-semibold mb-2 dark:text-white">
          Tatuadores
        </Text>
        <FlatList
          data={tattooArtists}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderUserItem}
          className="mb-6"
        />

        <Text className="text-lg font-semibold mb-2 dark:text-white">
          Diseñadores
        </Text>
        <FlatList
          data={designers}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderUserItem}
          className="mb-6"
        />
      </>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 px-2">
      <View className="p-4">
        <View className="flex-row items-center p-2 rounded-full bg-gray-100 dark:bg-neutral-800 mb-4">
          <Ionicons name="search" size={22} color={iconColor} />
          <TextInput
            className="flex-1 ml-2 text-base dark:text-white"
            placeholder="Buscar usuarios"
            placeholderTextColor={
              colorScheme === "dark" ? "#919191" : "#A0A0A0"
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
