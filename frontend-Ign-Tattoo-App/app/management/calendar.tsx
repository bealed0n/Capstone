import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, FlatList } from "react-native";
import { View, Text } from "../../components/Themed";
import { UserContext } from "../context/userContext";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { SERVER_URL } from "@/constants/constants";

interface Appointment {
  id: number;
  date: string;
  time: string;
  description: string;
  user_id: number;
  username: string;
}

export default function AppointmentsCalendar() {
  const colorScheme = useColorScheme();
  const { user, isLoggedIn } = useContext(UserContext);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
            setAppointments(data.appointments); // Asegúrate de que sea el campo correcto en la respuesta
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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Mapea las citas para la visualización en el calendario
  const markedDates = appointments.reduce(
    (acc: { [key: string]: any }, appointment) => {
      const date = appointment.date.split("T")[0]; // Extrae la fecha en formato 'YYYY-MM-DD'
      if (!acc[date]) {
        acc[date] = { marked: true, dots: [{ color: "blue" }] }; // Marca el día
      } else {
        acc[date].dots.push({ color: "blue" });
      }
      return acc;
    },
    {}
  );

  // Filtra las citas para el día seleccionado
  const selectedAppointments = selectedDate
    ? appointments.filter((appointment) =>
        appointment.date.startsWith(selectedDate)
      )
    : [];

  return (
    <View style={{ flex: 1, padding: 8 }}>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 24,
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        Calendario de citas
      </Text>
      <Calendar
        markingType={"multi-dot"}
        markedDates={markedDates}
        onDayPress={(day: any) => {
          console.log("Selected day", day);
          setSelectedDate(day.dateString); // Establece la fecha seleccionada
        }}
        className="rounded-lg"
        theme={{
          backgroundColor: "#222",
          calendarBackground: colorScheme === "dark" ? "#222" : "#c9c9c9",

          textSectionTitleColor: colorScheme === "dark" ? "#fff" : "#000",
          selectedDayBackgroundColor:
            colorScheme === "dark" ? "#333" : "#f4511e",
          selectedDayTextColor: "white",
          todayTextColor: "red",
          dayTextColor: colorScheme === "dark" ? "#fff" : "#000",
          textDisabledColor: "#888", //888
          monthTextColor: colorScheme === "dark" ? "#fff" : "#000",
          arrowColor: colorScheme === "dark" ? "#fff" : "#000",
        }}
      />
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          Citas para el día seleccionado
        </Text>
        {selectedAppointments.length > 0 ? (
          <FlatList
            data={selectedAppointments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 8,
                  marginVertical: 8,
                  backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
                >
                  Hora: {item.time}
                </Text>
                <Text
                  style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
                >
                  Descripcion: {item.description}
                </Text>
                <Text
                  style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
                >
                  {user?.role === "user"
                    ? `Tatuador: ${item.username}`
                    : `Cliente: ${item.username}`}
                </Text>
                <Text
                  style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
                >
                  Fecha: {format(new Date(item.date), "dd/MMM/yyyy")}
                </Text>
              </View>
            )}
          />
        ) : (
          <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
            No hay citas para este día
          </Text>
        )}
      </View>
    </View>
  );
}
