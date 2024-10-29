import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, useColorScheme, FlatList } from 'react-native';
import { View, Text } from '@/components/Themed';
import { UserContext } from '@/app/context/userContext'; // Ajusta la ruta según tu proyecto
import { Calendar } from 'react-native-calendars'; // Importa Calendar

interface Appointment {
    id: number;
    date: string; // Formato 'YYYY-MM-DD'
    time: string; // Formato 'HH:mm:ss'
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
                    let url = '';
                    if (user.role === 'tattoo_artist') {
                        url = `http://192.168.100.87:3000/tattoo-artist/${user.id}/appointments`;
                    } else if (user.role === 'user') {
                        url = `http://192.168.100.87:3000/user/${user.id}/appointments`;
                    }

                    const response = await fetch(url);
                    const data = await response.json();
                    if (Array.isArray(data.appointments)) {
                        setAppointments(data.appointments); // Asegúrate de que sea el campo correcto en la respuesta
                        console.log("Appointments fetched:", data.appointments);
                    } else {
                        console.error("Appointments data is not an array:", data.appointments);
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
    const markedDates = appointments.reduce((acc: { [key: string]: any }, appointment) => {
        const date = appointment.date.split('T')[0]; // Extrae la fecha en formato 'YYYY-MM-DD'
        if (!acc[date]) {
            acc[date] = { marked: true, dots: [{ color: 'blue' }] }; // Marca el día
        } else {
            acc[date].dots.push({ color: 'blue' });
        }
        return acc;
    }, {});

    // Filtra las citas para el día seleccionado
    const selectedAppointments = selectedDate
        ? appointments.filter(appointment => appointment.date.startsWith(selectedDate))
        : [];

    return (
        <View style={{ flex: 1, padding: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 24, marginTop: 8, marginBottom: 16 }}>Appointments Calendar</Text>
            <Calendar
                markingType={'multi-dot'}
                markedDates={markedDates}
                onDayPress={(day: any) => {
                    console.log('Selected day', day);
                    setSelectedDate(day.dateString); // Establece la fecha seleccionada
                }}
                theme={{
                    backgroundColor: '#222',
                    calendarBackground: '#222',
                    textSectionTitleColor: 'white',
                    selectedDayBackgroundColor: 'blue',
                    selectedDayTextColor: 'white',
                    todayTextColor: 'red',
                    dayTextColor: 'white',
                    textDisabledColor: '#888',
                }}
            />
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Appointments for Selected Day</Text>
                {selectedAppointments.length > 0 ? (
                    <FlatList
                        data={selectedAppointments}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={{ padding: 8, marginVertical: 8, backgroundColor: colorScheme === 'dark' ? '#333' : '#fff', borderRadius: 8 }}>
                                <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Time: {item.time}</Text>
                                <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Description: {item.description}</Text>
                                <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
                                    {user?.role === 'user' ? `Tattoo Artist: ${item.username}` : `Client: ${item.username}`}
                                </Text>
                            </View>
                        )}
                    />
                ) : (
                    <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>No appointments for this day.</Text>
                )}
            </View>
        </View>
    );
}