import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "./useColorScheme"; // Ajusta el import si el hook está en otro lugar
import { Href, router } from "expo-router";
import debounce from "lodash.debounce";

const SERVER_URL = "http://192.168.100.87:3000";

interface User {
  id: number;
  username: string;
  profile_pic: string | null;
  role: string;
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";

  const fetchUsers = debounce(async (query: string) => {
    if (!query) {
      setUsers([]);
      setNoResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/search/users?query=${query}`);
      const data = await response.json();
      setUsers(data.users);
      setNoResults(data.users.length === 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    fetchUsers(searchQuery);
  }, [searchQuery]);

  const beautifyRole = (role: string) => {
    switch (role) {
      case "tattoo_artist":
        return "Tattoo Artist";
      case "designer":
        return "Designer";
      default:
        return role;
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          borderRadius: 10,
          margin: 8,
          borderColor: colorScheme === "dark" ? "#444" : "#ccc",
          borderWidth: 1,
          backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          height: 48,
        }}
      >
        <Ionicons name="search" size={22} color={iconColor} />
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: "500",
            marginLeft: 8,
            color: colorScheme === "dark" ? "#FFF" : "#333",
          }}
          placeholder="Search"
          placeholderTextColor={colorScheme === "dark" ? "#919191" : "#A0A0A0"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator
          size="large"
          color={iconColor}
          style={{ marginVertical: 10 }}
        />
      )}

      {/* No Results Text */}
      {!loading && noResults && (
        <Text style={{ textAlign: "center", color: "gray", marginTop: 16 }}>
          No users found.
        </Text>
      )}

      {/* FlatList */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/profile/${item.id}` as Href)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: colorScheme === "dark" ? "#444" : "#ccc",
              }}
            >
              <Image
                source={
                  item.profile_pic
                    ? { uri: `${SERVER_URL}${item.profile_pic}` }
                    : require("@/assets/images/user.png")
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 12,
                }}
              />
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: colorScheme === "dark" ? "#FFF" : "#000",
                  }}
                >
                  @{item.username}
                </Text>
                <Text style={{ color: "gray" }}>{beautifyRole(item.role)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        ListEmptyComponent={
          !loading && noResults ? (
            <Text style={{ textAlign: "center", color: "gray", marginTop: 16 }}>
              No users found.
            </Text>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
