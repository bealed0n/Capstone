import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  useColorScheme,
} from "react-native";
import { UserContext } from "../context/userContext";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";

interface DesignRequest {
  id: number;
  buyer_id: number;
  buyer_username: string;
  message: string;
  reference_image: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  project_id?: number;
  project_image?: string;
  project_title?: string;
  project_description?: string;
}

export default function RequestDesigns() {
  const { user } = useContext(UserContext);
  const colorScheme = useColorScheme();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DesignRequest | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerValue, setPickerValue] = useState<string>("pending");

  useEffect(() => {
    fetchDesignRequests();
  }, []);

  const fetchDesignRequests = async () => {
    try {
      const response = await fetch(
        `http://192.168.100.87:3000/design-requests/designer/${user?.id}`
      );
      const data = await response.json();
      console.log("Design requests data:", data); // Debug log

      if (Array.isArray(data)) {
        // Map the project data with the project details
        const requestsWithDetails = await Promise.all(
          data.map(async (request: DesignRequest) => {
            // Fetch project details if project_id exists
            if (request.project_id) {
              const projectResponse = await fetch(
                `http://192.168.100.87:3000/designer/projects/${request.project_id}`
              );
              const projectData = await projectResponse.json();
              return {
                ...request,
                project_image: projectData.image,
                project_title: projectData.title,
                project_description: projectData.description,
              };
            }
            return request;
          })
        );

        setRequests(requestsWithDetails);
      } else {
        console.error("Unexpected data format:", data);
      }
    } catch (error) {
      console.error("Error fetching design requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDesignRequests();
    }
  }, [user?.id]);

  const updateRequestStatus = async (
    requestId: number,
    newStatus: string,
    buyerId: number
  ) => {
    try {
      const response = await fetch(
        `http://192.168.100.87:3000/design-requests/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            message: `Your design request has been ${newStatus}. ${replyMessage}`,
            sender_id: user.id,
            receiver_id: buyerId,
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          "Success",
          "Design request status updated and message sent."
        );
        fetchDesignRequests();
        setModalVisible(false);
        setReplyMessage("");
        setPickerVisible(false);
      } else {
        Alert.alert("Error", "Failed to update request status.");
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      Alert.alert(
        "Error",
        "An error occurred while updating the request status."
      );
    }
  };

  const renderRequest = ({ item }: { item: DesignRequest }) => (
    <View
      className={`p-4 my-2 rounded-xl ${
        colorScheme === "dark" ? "bg-neutral-800" : "bg-neutral-100"
      }`}
    >
      <Text
        className={`text-lg font-bold ${
          colorScheme === "dark" ? "text-white" : "text-black"
        }`}
      >
        From: {item.buyer_username}
      </Text>

      {item.project_id && (
        <View className="mt-2 p-2 rounded-lg bg-opacity-20 bg-gray-500">
          <Text
            className={`font-semibold ${
              colorScheme === "dark" ? "text-white" : "text-black"
            }`}
          >
            Requested Design: {item.project_title}
          </Text>
          <Text
            className={`mt-1 ${
              colorScheme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {item.project_description}
          </Text>
          {item.project_image && (
            <Image
              source={{
                uri: `http://192.168.100.87:3000${item.project_image}`,
              }}
              className="w-full h-40 rounded-lg mt-2"
              resizeMode="cover"
            />
          )}
        </View>
      )}

      <Text
        className={`mt-2 ${
          colorScheme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Message: {item.message}
      </Text>

      <Text
        className={`mt-2 ${
          colorScheme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Status: {item.status}
      </Text>
      <Text
        className={`mt-2 ${
          colorScheme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Date: {format(new Date(item.created_at), "dd/MMM/yyyy HH:mm")}
      </Text>

      {item.reference_image && (
        <Image
          source={{ uri: `http://192.168.100.87:3000${item.reference_image}` }}
          className="w-full h-40 rounded-lg mt-2"
          resizeMode="cover"
        />
      )}

      {item.status === "pending" && (
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            onPress={() => {
              setSelectedRequest(item);
              setModalVisible(true);
            }}
            className="bg-blue-500 px-4 py-2 rounded-lg flex-1 mr-2"
          >
            <Text className="text-white text-center">Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedRequest(item);
              setPickerVisible(true);
            }}
            className="bg-yellow-500 px-4 py-2 rounded-lg flex-1 ml-2"
          >
            <Text className="text-white text-center">Change Status</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4 dark:text-white">
        Design Requests
      </Text>

      {requests.length === 0 ? (
        <Text className="text-center mt-4 text-gray-500">
          No design requests yet
        </Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequest}
        />
      )}

      {/* Status Change Modal */}
      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`w-[80%] p-4 rounded-xl ${
              colorScheme === "dark" ? "bg-neutral-800" : "bg-white"
            }`}
          >
            <Picker
              selectedValue={pickerValue}
              onValueChange={setPickerValue}
              style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
            >
              <Picker.Item label="Pending" value="pending" />
              <Picker.Item label="Accepted" value="accepted" />
              <Picker.Item label="Rejected" value="rejected" />
            </Picker>

            <TextInput
              placeholder="Add a message..."
              value={replyMessage}
              onChangeText={setReplyMessage}
              className={`border border-gray-300 rounded p-2 mt-4 ${
                colorScheme === "dark" ? "text-white" : "text-black"
              }`}
              multiline
            />

            <TouchableOpacity
              onPress={() => {
                if (selectedRequest) {
                  updateRequestStatus(
                    selectedRequest.id,
                    pickerValue,
                    selectedRequest.buyer_id
                  );
                }
              }}
              className="bg-blue-500 p-3 rounded mt-4"
            >
              <Text className="text-white text-center font-bold">
                Update Status
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPickerVisible(false)}
              className="bg-gray-500 p-3 rounded mt-2"
            >
              <Text className="text-white text-center font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reply Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`w-[80%] p-4 rounded-xl ${
              colorScheme === "dark" ? "bg-neutral-800" : "bg-white"
            }`}
          >
            <Text
              className={`text-xl font-bold mb-4 ${
                colorScheme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Reply to {selectedRequest?.buyer_username}
            </Text>

            <TextInput
              placeholder="Type your message..."
              value={replyMessage}
              onChangeText={setReplyMessage}
              className={`border border-gray-300 rounded p-2 h-32 ${
                colorScheme === "dark" ? "text-white" : "text-black"
              }`}
              multiline
            />

            <TouchableOpacity
              onPress={() => {
                if (selectedRequest) {
                  // Handle sending message
                }
              }}
              className="bg-blue-500 p-3 rounded mt-4"
            >
              <Text className="text-white text-center font-bold">
                Send Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-gray-500 p-3 rounded mt-2"
            >
              <Text className="text-white text-center font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
