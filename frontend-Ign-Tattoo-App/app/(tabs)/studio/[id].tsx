// app/studio/[id].tsx

import React, { useState, useEffect } from "react";
import {
  Image,
  RefreshControl,
  TouchableOpacity,
  SectionList,
  useColorScheme,
  Alert,
  ActivityIndicator,
  View,
  Text,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useRoute, RouteProp } from "@react-navigation/native";
import { SERVER_URL } from "@/constants/constants";

interface Slot {
  slot_number: number;
  is_available: boolean;
  assigned_tattoo_artist: string | null;
}

interface TattooArtist {
  artist_id: number;
  artist_name: string;
  artist_email: string;
  profile_pic: string | null;
}

interface Studio {
  studio_id: number;
  studio_name: string;
  address: string;
  description: string;
  image_url: string;
  created_at: string;
  owner_name: string;
  owner_email: string;
  owner_id: number;
}

interface StudioResponse {
  studio: Studio;
  slots: Slot[];
  tattoo_artists: TattooArtist[];
}

interface RouteParams {
  id: string;
}

export default function StudioPage() {
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { id } = route.params;
  const [studioData, setStudioData] = useState<StudioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchStudioData();
    }
  }, [id]);

  const fetchStudioData = async () => {
    try {
      // Obtener los datos del estudio
      const response = await fetch(`${SERVER_URL}/tattoo-studios/${id}`);
      console.log("id studio", id);
      if (!response.ok) {
        throw new Error("Error al obtener los datos del estudio");
      }
      const data: StudioResponse = await response.json();
      setStudioData(data);
    } catch (error) {
      console.error("Error fetching studio data:", error);
      Alert.alert("Error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudioData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!studioData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">
          No se pudo cargar el estudio.
        </Text>
      </View>
    );
  }

  const { studio, slots, tattoo_artists } = studioData;

  const sections: {
    title: string;
    data: any[];
    renderItem: ({ item }: { item: any }) => JSX.Element;
  }[] = [
    {
      title: "Información del Estudio",
      data: [studio],
      renderItem: ({ item }: { item: Studio }) => (
        <View className="p-4 items-center">
          <Image
            source={
              item.image_url
                ? { uri: `${SERVER_URL}${item.image_url}` }
                : require("../../../assets/images/user.png") // Imagen por defecto
            }
            className="w-64 h-64 rounded-full"
          />
          <Text className="text-3xl font-bold mt-4 text-center text-black dark:text-white">
            {item.studio_name}
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            {item.description}
          </Text>
          <Text className="text-gray-500 mt-1 flex-row items-center">
            <FontAwesome5
              name="map-marker-alt"
              size={16}
              color={isDarkMode ? "white" : "black"}
            />{" "}
            {item.address}
          </Text>
          <Text className="text-gray-500 mt-1">
            Propietario: {item.owner_name}
          </Text>
        </View>
      ),
    },
    {
      title: "Artistas del Estudio",
      data: tattoo_artists,
      renderItem: ({ item }: { item: TattooArtist }) => (
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/user/${item.artist_id}` as Href)}
          className="flex-row items-center p-2 border-b border-gray-200"
        >
          <Image
            source={
              item.profile_pic
                ? { uri: `${SERVER_URL}${item.profile_pic}` }
                : require("../../../assets/images/user.png") // Imagen por defecto
            }
            className="w-12 h-12 rounded-full"
          />
          <View className="ml-4">
            <Text className="font-bold text-black dark:text-white">
              {item.artist_name}
            </Text>
          </View>
        </TouchableOpacity>
      ),
    },
    {
      title: "Disponibilidad de Slots",
      data: slots,
      renderItem: ({ item }: { item: Slot }) => (
        <View
          key={item.slot_number}
          className="flex-row items-center mb-2 ml-4"
        >
          <View
            className={`w-3 h-3 rounded-full mr-2 ${
              item.is_available ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <Text className="text-gray-700 dark:text-gray-300">
            Slot {item.slot_number} -{" "}
            {item.is_available
              ? "Disponible"
              : `Ocupado por ${item.assigned_tattoo_artist}`}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) =>
        item.artist_id ? item.artist_id.toString() : index.toString()
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderSectionHeader={({ section: { title } }) => (
        <View className="p-4">
          <Text className="text-2xl font-bold mb-2 text-black dark:text-white">
            {title}
          </Text>
        </View>
      )}
      ListEmptyComponent={() => (
        <View className="items-center mt-4">
          <FontAwesome5 name="user-slash" size={50} color="gray" />
          <Text className="mt-4 text-lg text-gray-500">
            No hay artistas registrados aún
          </Text>
        </View>
      )}
      stickyHeaderHiddenOnScroll={true}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
