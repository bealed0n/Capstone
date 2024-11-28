import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "./context/userContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { SERVER_URL } from "@/constants/constants";

interface Invitation {
  id: number;
  studio_id: number;
  studio_name: string;
  slot_id: number;
  slot_number: number;
  status: string;
}

export default function Notifications() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    if (!user) return;
    try {
      const response = await fetch(
        `${SERVER_URL}/tattoo-artist/${user.id}/invitations`
      );
      if (!response.ok) throw new Error("Failed to fetch invitations");
      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      Alert.alert("Error", "Failed to load invitations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (invitationId: number) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/studio-invitations/${invitationId}/accept`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to accept invitation");
      Alert.alert("Success", "Invitation accepted successfully");
      fetchInvitations();
    } catch (error) {
      console.error("Error accepting invitation:", error);
      Alert.alert("Error", "Failed to accept invitation");
    }
  };

  const handleReject = async (invitationId: number) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/studio-invitations/${invitationId}/reject`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to reject invitation");
      Alert.alert("Success", "Invitation rejected successfully");
      fetchInvitations();
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      Alert.alert("Error", "Failed to reject invitation");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvitations();
  };

  const renderInvitationItem = ({ item }: { item: Invitation }) => (
    <View className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <View className="flex-row items-center mb-2">
        <FontAwesome5 name="store-alt" size={24} color="#4B5563" />
        <Text className="text-lg font-semibold ml-2 text-gray-800 dark:text-white">
          {item.studio_name}
        </Text>
      </View>
      <Text className="text-gray-600 dark:text-gray-300 mb-2">
        Slot Number: {item.slot_number}
      </Text>
      <View className="flex-row justify-between mt-2">
        <TouchableOpacity
          onPress={() => handleAccept(item.id)}
          className="bg-green-500 py-2 px-4 rounded-full flex-row items-center"
        >
          <Feather name="check" size={18} color="white" />
          <Text className="text-white ml-1 font-semibold">Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleReject(item.id)}
          className="bg-red-500 py-2 px-4 rounded-full flex-row items-center"
        >
          <Feather name="x" size={18} color="white" />
          <Text className="text-white ml-1 font-semibold">Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4B5563" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-neutral-900">
      <View className="flex-row justify-between items-center p-4 bg-white dark:bg-neutral-800 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white">
          Invitaciones de estudio
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>
      {invitations.length > 0 ? (
        <FlatList
          data={invitations}
          renderItem={renderInvitationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4B5563"]}
            />
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Image
            source={require("../assets/images/no-notifications.png")}
            style={{ width: 200, height: 200, opacity: 0.7 }}
          />
          <Text className="text-xl font-semibold text-gray-600 dark:text-gray-300 mt-4">
            No hay invitaciones
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center px-4">
            Cuando un estudio te invite, aparecerá aquí
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
