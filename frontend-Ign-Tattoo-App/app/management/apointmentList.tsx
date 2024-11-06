import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image as RNImage,
  View,
  Text,
} from "react-native";
import { UserContext } from "../context/userContext";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import { styled } from "nativewind";

const StyledImage = styled(RNImage);

interface Appointment {
  id: number;
  date: string;
  username: string;
  time: string;
  description: string;
  user_id: number;
  status: string;
  reference_image_url: string | null; // Agregamos este campo
}

export default function AppointmentsList() {
  const colorScheme = useColorScheme();
  const { user, isLoggedIn } = useContext(UserContext);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(
    null
  );
  const [additionalMessage, setAdditionalMessage] = useState<string>("");
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [pickerValue, setPickerValue] = useState<string>("");
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: number]: boolean;
  }>({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user && isLoggedIn) {
        try {
          let url = "";
          if (user.role === "tattoo_artist") {
            url = `http://192.168.100.87:3000/tattoo-artist/${user.id}/appointments`;
          } else if (user.role === "user") {
            url = `http://192.168.100.87:3000/user/${user.id}/appointments`;
          }

          const response = await fetch(url);
          const data = await response.json();
          if (Array.isArray(data.appointments)) {
            setAppointments(data.appointments);
            console.log("Appointments fetched:", data.appointments);
          } else {
            console.error(
              "Appointments data is not an array:",
              data.appointments
            );
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [user, isLoggedIn]);

  const updateAppointmentStatus = async (
    appointmentId: number,
    newStatus: string,
    userId: number
  ) => {
    try {
      const response = await fetch(
        `http://192.168.100.87:3000/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            message:
              newStatus === "accepted"
                ? `Your appointment has been accepted. ${additionalMessage}`
                : `Your appointment has been ${newStatus}.`,
            sender_id: user.id,
            receiver_id: userId,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Appointment status updated and message sent.");
        // Actualizar la lista de citas
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: newStatus }
              : appointment
          )
        );
        setSelectedAppointment(null);
        setAdditionalMessage("");
      } else {
        Alert.alert("Error", "Failed to update appointment status.");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      Alert.alert(
        "Error",
        "An error occurred while updating the appointment status."
      );
    }
  };

  const toggleDescription = (appointmentId: number) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [appointmentId]: !prevState[appointmentId],
    }));
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1, padding: 8 }}>
      <Text className="font-bold text-2xl dark:text-white mt-1 mb-2">
        Appointments List
      </Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="p-2 bg-neutral-200 dark:bg-neutral-900 m-2 rounded-xl">
            <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
              Date: {format(new Date(item.date), "dd/MMM/yyyy")}
            </Text>
            <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
              {user?.role === "user"
                ? `Tattoo artist: ${item.username}`
                : `Client: ${item.username}`}
            </Text>
            <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
              Time: {item.time}
            </Text>

            {/* Mostrar imagen de referencia si existe */}
            {item.reference_image_url && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedImage(
                    `http://192.168.100.87:3000${item.reference_image_url}`
                  );
                  setModalVisible(true);
                }}
                style={{ marginVertical: 8 }}
              >
                <StyledImage
                  source={{
                    uri: `http://192.168.100.87:3000${item.reference_image_url}`,
                  }}
                  className="w-full h-40 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}

            {/* Descripción con 'Mostrar más' */}
            <View>
              <Text
                numberOfLines={expandedDescriptions[item.id] ? undefined : 3}
                ellipsizeMode="tail"
                style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
              >
                Description: {item.description}
              </Text>
              {item.description.length > 100 && (
                <TouchableOpacity onPress={() => toggleDescription(item.id)}>
                  <Text
                    style={{
                      color: "#007bff",
                      marginTop: 4,
                    }}
                  >
                    {expandedDescriptions[item.id]
                      ? "Mostrar menos"
                      : "Mostrar más"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
              Status: {item.status}
            </Text>
            {user?.role === "tattoo_artist" && (
              <View className="bg-neutral-200 dark:bg-neutral-900">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedAppointment(item.id);
                    setPickerValue(item.status);
                    setPickerVisible(true);
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 5,
                    marginTop: 10,
                  }}
                  className="bg-neutral-100 dark:bg-neutral-800"
                >
                  <Text
                    style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
                  >
                    Change Status
                  </Text>
                </TouchableOpacity>
                {selectedAppointment === item.id &&
                  item.status === "accepted" && (
                    <TextInput
                      placeholder="Additional message"
                      value={additionalMessage}
                      onChangeText={setAdditionalMessage}
                      style={{
                        borderColor: "gray",
                        borderWidth: 1,
                        padding: 8,
                        marginTop: 8,
                        color: colorScheme === "dark" ? "#fff" : "#000",
                      }}
                    />
                  )}
              </View>
            )}
          </View>
        )}
      />

      {/* Modal para mostrar la imagen en grande */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setModalVisible(false)}
        >
          {selectedImage && (
            <StyledImage
              source={{ uri: selectedImage }}
              style={{ width: "90%", height: "70%" }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>

      {/* Modal para el Picker de estado */}
      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: 300,
              borderRadius: 10,
              padding: 20,
              backgroundColor: colorScheme === "dark" ? "#333333" : "#ffffff",
            }}
          >
            <Picker
              selectedValue={pickerValue}
              onValueChange={(value: string) => setPickerValue(value)}
              style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
            >
              <Picker.Item label="Pending" value="pending" />
              <Picker.Item label="Accepted" value="accepted" />
              <Picker.Item label="Rejected" value="rejected" />
            </Picker>
            <TouchableOpacity
              onPress={() => {
                if (selectedAppointment !== null) {
                  updateAppointmentStatus(
                    selectedAppointment,
                    pickerValue,
                    appointments.find((app) => app.id === selectedAppointment)
                      ?.user_id || 0
                  );
                }
                setPickerVisible(false);
              }}
              style={{
                padding: 10,
                backgroundColor: "#007bff",
                borderRadius: 5,
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                Confirm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPickerVisible(false)}
              style={{
                padding: 10,
                backgroundColor: "#ccc",
                borderRadius: 5,
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#000", textAlign: "center" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
