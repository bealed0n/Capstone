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
  ScrollView,
} from "react-native";
import { UserContext } from "../context/userContext";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import { styled } from "nativewind";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SERVER_URL } from "@/constants/constants";

const StyledImage = styled(RNImage);

interface Appointment {
  id: number;
  date: string;
  username: string;
  time: string;
  description: string;
  user_id: number;
  status: string;
  reference_image_url: string | null;
}

const statusMap = {
  accepted: "Aceptado",
  rejected: "Rechazado",
  pending: "Pendiente",
  Completed: "Completado",
};

const reverseStatusMap = {
  Aceptado: "Accepted",
  Rechazado: "Rejected",
  Pendiente: "Pending",
};

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

  // New state for availability modal
  const [availabilityModalVisible, setAvailabilityModalVisible] =
    useState<boolean>(false);
  const [availabilityDate, setAvailabilityDate] = useState<Date>(new Date());
  const [availabilityStartTime, setAvailabilityStartTime] = useState<Date>(
    new Date()
  );

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [availabilityDescription, setAvailabilityDescription] =
    useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user && isLoggedIn) {
        try {
          let url = "";
          if (user.role === "tattoo_artist") {
            url = `${SERVER_URL}/tattoo-artist/${user.id}/appointments`;
          } else if (user.role === "user") {
            url = `${SERVER_URL}/user/${user.id}/appointments`;
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
        `${SERVER_URL}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            message:
              newStatus === "accepted"
                ? `Tu cita ha sido aceptada. ${additionalMessage}`
                : `Tu cita ha sido: ${newStatus}.`,
            sender_id: user.id,
            receiver_id: userId,
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          "Exitoso",
          "Estado de la cita actualizado y se ha mensaje enviado."
        );
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

  const completeAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/appointments/${appointmentId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        Alert.alert("Éxito", "El servicio ha sido finalizado.");
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: "Completed" }
              : appointment
          )
        );
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      Alert.alert("Error", "Ocurrió un error al finalizar el servicio.");
    }
  };

  const toggleDescription = (appointmentId: number) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [appointmentId]: !prevState[appointmentId],
    }));
  };

  const handleRegisterAvailability = async () => {
    if (!user || user.role !== "tattoo_artist") {
      Alert.alert("Error", "Only tattoo artists can register availability.");
      return;
    }

    try {
      const response = await fetch(
        `${SERVER_URL}/tattoo-artist/${user.id}/availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: format(availabilityDate, "yyyy-MM-dd"),
            start_time: format(availabilityStartTime, "HH:mm:ss"),
            is_available: isAvailable,
            description: availabilityDescription,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Availability registered successfully.");
        setAvailabilityModalVisible(false);
        // You might want to refresh the appointments list here
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to register availability."
        );
      }
    } catch (error) {
      console.error("Error registering availability:", error);
      Alert.alert("Error", "An error occurred while registering availability.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1, padding: 8 }}>
      <Text className="font-bold text-2xl dark:text-white mt-1 mb-2">
        Lista de citas
      </Text>
      {user?.role === "tattoo_artist" && (
        <TouchableOpacity
          onPress={() => setAvailabilityModalVisible(true)}
          className="bg-blue-500 p-2 rounded-md mb-4"
        >
          <Text className="text-white text-center font-bold">
            Registrar Disponibilidad
          </Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="p-2 bg-neutral-200 dark:bg-neutral-900 m-2 rounded-xl">
            <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
              Fecha: {format(new Date(item.date), "dd/MMM/yyyy")}
            </Text>
            <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
              {user?.role === "user"
                ? `Tatuador: ${item.username}`
                : `Cliente: ${item.username}`}
            </Text>
            <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
              Hora: {item.time}
            </Text>

            {item.reference_image_url && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedImage(`${SERVER_URL}${item.reference_image_url}`);
                  setModalVisible(true);
                }}
                style={{ marginVertical: 8 }}
              >
                <StyledImage
                  source={{
                    uri: `${SERVER_URL}${item.reference_image_url}`,
                  }}
                  className="w-full h-40 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}

            <View>
              <Text
                numberOfLines={expandedDescriptions[item.id] ? undefined : 3}
                ellipsizeMode="tail"
                style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
              >
                Descripcion: {item.description}
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
              Estado: {statusMap[item.status as keyof typeof statusMap]}
            </Text>
            {user?.role === "tattoo_artist" && item.status !== "Completed" && (
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
                    Cambiar estado
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
                <TouchableOpacity
                  className="bg-blue-500"
                  style={{
                    padding: 10,
                    borderRadius: 5,
                    marginTop: 10,
                  }}
                  onPress={() => {
                    Alert.alert(
                      "Confirmación",
                      "¿Está seguro de que desea finalizar el servicio?",
                      [
                        {
                          text: "Cancelar",
                          style: "cancel",
                        },
                        {
                          text: "Aceptar",
                          onPress: () => completeAppointment(item.id),
                        },
                      ],
                      { cancelable: false }
                    );
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    FINALIZAR SERVICIO
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: colorScheme === "dark" ? "#fff" : "#000",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No hay citas aun.
          </Text>
        }
      />

      {/* Modal for showing the image in full size */}
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

      {/* Modal for the status Picker */}
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
              <Picker.Item label="Pendiente" value="pending" />
              <Picker.Item label="Aceptado" value="accepted" />
              <Picker.Item label="Rechazado" value="rejected" />
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

      {/* New Modal for Registering Availability */}
      <Modal
        visible={availabilityModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvailabilityModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white dark:bg-gray-800 p-4 rounded-lg w-4/5">
            <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Registrar Disponibilidad
            </Text>
            <ScrollView>
              <Text className="text-gray-800 dark:text-white mb-2">Fecha:</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text className="border border-gray-300 dark:border-gray-600 rounded p-2 mb-4 text-gray-800 dark:text-white">
                  {format(availabilityDate, "dd/MM/yyyy")}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={availabilityDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (event.type === "set") {
                      const currentDate = selectedDate || availabilityDate;
                      setAvailabilityDate(currentDate);
                    }
                    // Cerrar el DatePicker después de seleccionar
                    setShowDatePicker(false);
                  }}
                />
              )}
              <Text className="text-gray-800 dark:text-white mb-2 mt-4">
                Hora:
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <Text className="border border-gray-300 dark:border-gray-600 rounded p-2 mb-4 text-gray-800 dark:text-white">
                  {format(availabilityStartTime, "hh:mm a")}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={availabilityStartTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedTime) => {
                    if (event.type === "set") {
                      const currentTime = selectedTime || availabilityStartTime;
                      setAvailabilityStartTime(currentTime);
                    }
                    // Cerrar el TimePicker después de seleccionar
                    setShowTimePicker(false);
                  }}
                />
              )}
              <Text className="text-gray-800 dark:text-white">
                Descripción:
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded p-2 mb-4 text-gray-800 dark:text-white mt-2"
                placeholder="Descripción"
                value={availabilityDescription}
                onChangeText={setAvailabilityDescription}
                placeholderTextColor={colorScheme === "dark" ? "#fff" : "#000"}
                multiline
              />
              <View className="flex-row items-center mb-4">
                <Text className="text-gray-800 dark:text-white mr-2">
                  Disponible:
                </Text>
                <TouchableOpacity
                  onPress={() => setIsAvailable(!isAvailable)}
                  className={`p-2 rounded-md ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
                >
                  <Text className="text-white font-bold">
                    {isAvailable ? "Yes" : "No"}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded-md mb-2"
                onPress={handleRegisterAvailability}
              >
                <Text className="text-white text-center font-bold">
                  Registrar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-500 p-2 rounded-md"
                onPress={() => setAvailabilityModalVisible(false)}
              >
                <Text className="text-white text-center font-bold">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
