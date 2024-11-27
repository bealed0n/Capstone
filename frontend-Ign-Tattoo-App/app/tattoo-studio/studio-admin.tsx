import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
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

export default function StudioAdminView() {
  const route = useRoute();
  const { studioId } = route.params as RouteParams;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TattooArtist[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvitations();
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

  const sendInvitation = async (artistId: number) => {
    try {
      const response = await fetch(`${SERVER_URL}/studio-invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studio_id: studioId,
          slot_id: 1, // Assuming slot 1 is always available. You might want to implement slot selection.
          tattoo_artist_id: artistId,
        }),
      });
      if (!response.ok) throw new Error("Failed to send invitation");
      Alert.alert("Success", "Invitation sent successfully");
      fetchInvitations(); // Refresh the invitations list
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
      // You might want to refresh the studio data here
    } catch (error) {
      console.error("Error removing artist:", error);
      Alert.alert("Error", "Failed to remove artist");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInvitations();
    setRefreshing(false);
  }, []);

  const renderArtistItem = ({ item }: { item: TattooArtist }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <View className="flex-row items-center">
        <Image
          source={
            item.profile_pic
              ? { uri: `${SERVER_URL}${item.profile_pic}` }
              : require("../../assets/images/user.png")
          }
          className="w-12 h-12 rounded-full"
        />
        <Text className="ml-4 font-semibold">{item.username}</Text>
      </View>
      <TouchableOpacity
        onPress={() => sendInvitation(item.id)}
        className="bg-blue-500 px-4 py-2 rounded-md"
      >
        <Text className="text-white">Invite</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInvitationItem = ({ item }: { item: Invitation }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <Text>{item.tattoo_artist_name}</Text>
      <Text className="text-gray-500">{item.status}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-gray-100">
        <Text className="text-2xl font-bold mb-4">Manage Studio Members</Text>
        <TextInput
          className="bg-white p-2 rounded-md"
          placeholder="Search for tattoo artists..."
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
            <Text className="text-center mt-4 text-gray-500">
              {searchQuery
                ? "No artists found"
                : "Start typing to search for artists"}
            </Text>
          )}
        />
      )}

      <View className="mt-8 p-4 bg-gray-100">
        <Text className="text-2xl font-bold mb-4">Pending Invitations</Text>
        <FlatList
          data={invitations}
          renderItem={renderInvitationItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <Text className="text-center mt-4 text-gray-500">
              No pending invitations
            </Text>
          )}
        />
      </View>
    </View>
  );
}
