import React, { useContext, useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, useColorScheme, View, Text } from 'react-native';
import { UserContext } from '@/app/context/userContext';
import { format } from 'date-fns';

interface Appointment {
    id: number;
    date: string;
    username: string;
    time: string;
    description: string;
    user_id: number;
}

export default function AppointmentsList() {
    const colorScheme = useColorScheme();
    const { user, isLoggedIn } = useContext(UserContext);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <View style={{ flex: 1, padding: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 24, marginTop: 8, marginBottom: 16 }}>Appointments List</Text>
            <FlatList
                data={appointments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ padding: 8, marginVertical: 8, backgroundColor: colorScheme === 'dark' ? '#333' : '#fff', borderRadius: 8 }}>
                        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Date: {format(new Date(item.date), 'PPpp')}</Text>
                        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
                            {user?.role === 'user' ? `Tattoo artist: ${item.username}` : `Client: ${item.username}`}
                        </Text>
                        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Time: {item.time}</Text>
                        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Description: {item.description}</Text>
                    </View>
                )}
            />
        </View>
    );
}