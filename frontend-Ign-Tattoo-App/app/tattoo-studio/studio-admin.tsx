import React, { useState, useEffect, useCallback } from "react";
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text, View } from "../../components/Themed";
import { useRoute } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { debounce } from "lodash";
import { SERVER_URL } from "@/constants/constants";

interface TattooArtist {
  id: number;
  username: string;
  profile_pic: string | null;
  role: string;
}

interface Invitation {
  id: number;
  studio_id: number;
  slot_id: number;
  tattoo_artist_id: number;
  tattoo_artist_name: string;
  status: string;
}

interface RouteParams {
  studioId: string;
}

interface StudioMember {
  artist_id: number;
  artist_name: string;
  artist_email: string;
  profile_pic: string | null;
}

export default function StudioAdminView() {
  const route = useRoute();
  const { studioId } = route.params as RouteParams;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TattooArtist[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [studioMembers, setStudioMembers] = useState<StudioMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvitations();
    fetchStudioMembers();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/tattoo-studios/${studioId}/invitations`
      );
      if (!response.ok) throw new Error("Failed to fetch invitations");
      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      Alert.alert("Error", "Failed to load invitations");
    }
  };

  const fetchStudioMembers = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/tattoo-studios/${studioId}/members`
      );
      if (!response.ok) throw new Error("Failed to fetch studio members");
      const data = await response.json();
      setStudioMembers(data);
      console.log("Studio members:", data);
    } catch (error) {
      console.error("Error fetching studio members:", error);
      Alert.alert("Error", "Failed to load studio members");
    }
  };

  const searchArtists = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${SERVER_URL}/search/tattoer-studio?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to search artists");
      const data = await response.json();
      setSearchResults(data.users);
    } catch (error) {
      console.error("Error searching artists:", error);
      Alert.alert("Error", "Failed to search artists");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchArtists, 300), []);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/available-slots?studio_id=${studioId}`
      );
      if (!response.ok) throw new Error("Failed to fetch available slots");
      const data = await response.json();
      return data.slots;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      Alert.alert("Error", "Failed to fetch available slots");
      return [];
    }
  };

  const sendInvitation = async (artistId: number) => {
    try {
      const availableSlots = await fetchAvailableSlots();
      if (availableSlots.length === 0) {
        Alert.alert("Error", "No available slots");
        return;
      }

      const slotId = availableSlots[0].id;

      const response = await fetch(`${SERVER_URL}/studio-invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studio_id: studioId,
          slot_id: slotId,
          tattoo_artist_id: artistId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send invitation");
      Alert.alert("Success", "Invitation sent successfully");
      fetchInvitations();
    } catch (error) {
      console.error("Error sending invitation:", error);
      Alert.alert("Error", "Failed to send invitation");
    }
  };

  const removeArtist = async (artistId: number) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/tattoo-studios/${studioId}/remove-artist/${artistId}`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to remove artist");
      Alert.alert("Success", "Artist removed successfully");
      fetchStudioMembers();
    } catch (error) {
      console.error("Error removing artist:", error);
      Alert.alert("Error", "Failed to remove artist");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInvitations();
    await fetchStudioMembers();
    setRefreshing(false);
  }, []);

  const renderArtistItem = ({ item }: { item: TattooArtist }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:bg-neutral-800">
      <View className="flex-row items-center dark:bg-neutral-800">
        <Image
          source={
            item.profile_pic
              ? { uri: `${SERVER_URL}${item.profile_pic}` }
              : require("../../assets/images/user.png")
          }
          className="w-12 h-12 rounded-full"
        />
        <Text className="ml-4 font-semibold dark:text-white ">
          {item.username}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => sendInvitation(item.id)}
        className="bg-blue-500 px-4 py-2 rounded-md"
      >
        <Text className="text-white">Invite</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStudioMember = ({ item }: { item: StudioMember }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:bg-neutral-800">
      <View className="flex-row items-center dark:bg-neutral-800">
        <Image
          source={
            item.profile_pic
              ? { uri: `${SERVER_URL}${item.profile_pic}` }
              : require("../../assets/images/user.png")
          }
          className="w-12 h-12 rounded-full"
        />
        <View className="ml-4 bg-neutral-800">
          <Text className="font-semibold dark:text-white">
            {item.artist_name}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {item.artist_email}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeArtist(item.artist_id)}
        className="bg-red-500 px-4 py-2 rounded-md"
      >
        <Text className="text-white">Expulsar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInvitationItem = ({ item }: { item: Invitation }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:bg-neutral-800">
      <Text>{item.tattoo_artist_name}</Text>
      <Text className="text-gray-500">{item.status}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <View className="p-4 bg-gray-100 dark:bg-neutral-900">
        <Text className="text-2xl font-bold mb-4 dark:text-white">
          Administrar Integrantes
        </Text>
        <TextInput
          className="bg-white p-2 rounded-md"
          placeholder="Buscar tatuadores..."
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderArtistItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <Text className="text-center mt-4 text-gray-500 ">
              {searchQuery
                ? "No se encontraron tatuadores"
                : "Empieza a buscar tatuadores para invitarlos al estudio"}
            </Text>
          )}
        />
      )}

      <View className="mt-8 p-4 bg-gray-100 dark:bg-neutral-800">
        <Text className="text-2xl font-bold mb-4 dark:text-white">
          Miembros del estudio
        </Text>
        <FlatList
          data={studioMembers}
          renderItem={renderStudioMember}
          keyExtractor={(item) => item.artist_id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <Text className="text-center mt-4 text-gray-500">
              No hay miembros en el estudio
            </Text>
          )}
        />
      </View>

      <View className="mt-8 p-4 bg-gray-100 dark:bg-neutral-800">
        <Text className="text-2xl font-bold mb-4 dark:text-white">
          Invitaciones pendientes
        </Text>
        <FlatList
          data={invitations}
          renderItem={renderInvitationItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <Text className="text-center mt-4 text-gray-500">
              No hay invitaciones pendientes
            </Text>
          )}
        />
      </View>
    </View>
  );
}
