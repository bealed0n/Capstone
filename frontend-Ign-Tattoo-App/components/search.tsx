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
import { useColorScheme } from "react-native"; // Ajusta el import si está en otro lugar
import { Href, router } from "expo-router";
import debounce from "lodash.debounce";

const SERVER_URL = "http://192.168.100.87:3000"; // Asegúrate de que esta URL sea correcta

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

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [tattooStudios, setTattooStudios] = useState<TattooStudio[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";

  useEffect(() => {
    fetchTattooStudios();
  }, []);

  const fetchTattooStudios = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/tattoo-studios`);
      const data = await response.json();
      setTattooStudios(data);
    } catch (error) {
      console.error("Error fetching tattoo studios:", error);
    }
  };

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
      {/* Barra de búsqueda */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          borderRadius: 10,
          marginBottom: 8,
          borderColor: colorScheme === "dark" ? "#444" : "#ccc",
          borderWidth: 1,
          backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
          height: 48,
        }}
      >
        <Ionicons name="search" size={22} color={iconColor} />
        <TextInput
          className="flex-1 ml-2 px-1 justify-center py-0"
          placeholder="Buscar usuarios"
          placeholderTextColor={colorScheme === "dark" ? "#919191" : "#A0A0A0"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Resultados de búsqueda */}
      {searchQuery ? (
        <>
          {loading && (
            <ActivityIndicator
              size="large"
              color={iconColor}
              style={{ marginVertical: 10 }}
            />
          )}

          {!loading && noResults && (
            <Text
              style={{
                textAlign: "center",
                color: "gray",
                marginTop: 16,
              }}
            >
              No se encontraron usuarios.
            </Text>
          )}

          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/(tabs)/${item.id}` as Href)}
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
                        : require("../assets/images/user.png")
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
                    <Text style={{ color: "gray" }}>
                      {beautifyRole(item.role)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            ListEmptyComponent={
              !loading && noResults ? (
                <Text
                  style={{ textAlign: "center", color: "gray", marginTop: 16 }}
                >
                  No se encontraron usuarios.
                </Text>
              ) : null
            }
          />
        </>
      ) : (
        <>
          {/* Sección de Estudios */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginVertical: 10,
              textAlign: "center",
              color: colorScheme === "dark" ? "#FFF" : "#000",
            }}
          >
            Estudios
          </Text>
          <FlatList
            data={tattooStudios}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  marginRight: 16,
                }}
                onPress={() => router.push(`/studio/${item.id}` as Href)}
              >
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 10,
                    overflow: "hidden",
                    backgroundColor: "#eee",
                  }}
                >
                  <Image
                    source={
                      item.image_url
                        ? { uri: `${SERVER_URL}${item.image_url}` }
                        : require("../assets/images/user.png")
                    }
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <Text
                  style={{
                    marginTop: 8,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "bold",
                    color: colorScheme === "dark" ? "#FFF" : "#000",
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            style={{ marginBottom: 16 }}
          />
        </>
      )}
    </View>
  );
};

export default Search;
