import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { View, Text } from "../../components/Themed";
import { useRoute } from "@react-navigation/native";
import { format } from "date-fns";
import { Href, router } from "expo-router";
import { SERVER_URL } from "@/constants/constants";

export default function AvailableDates() {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const [availability, setAvailability] = useState<
    {
      id: number;
      date: string;
      start_time: string;
      end_time: string;
      description: string;
    }[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAvailability = async () => {
    if (typeof id === "string") {
      try {
        const response = await fetch(
          `${SERVER_URL}/tattoo-artist/${id}/availability`
        );
        const data = await response.json();
        setAvailability(data.availability);
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    } else {
      console.warn("ID no válido:", id);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailability();
    setRefreshing(false);
  };

  return (
    <View>
      <FlatList
        data={availability}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="p-2 my-1 border-b border-gray-300">
            <Text>Fecha: {format(new Date(item.date), "dd/MMM/yyyy")}</Text>
            <Text>Hora: {item.start_time}</Text>
            <Text>Descripción {item.description}</Text>
            <TouchableOpacity
              className="absolute right-2 top-4 mr-4 transform -translate-y-1/2 bg-yellow-400 px-2 rounded"
              onPress={() => {
                router.push({
                  pathname: "/management/dateRequest",
                  params: {
                    date: item.date,
                    time: item.start_time,
                    tattoo_artist_id: id,
                  },
                } as unknown as Href);
              }}
            >
              <View className="py-2 px-4 bg-yellow-400">
                <Text className="font-bold dark:text-black">Book</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text className="text-center text-lg text-gray-500">
            No se han publicado fechas disponibles
          </Text>
        }
      />
    </View>
  );
}
