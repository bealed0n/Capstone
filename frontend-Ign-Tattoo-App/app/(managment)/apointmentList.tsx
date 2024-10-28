import React, { useContext, useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, useColorScheme } from 'react-native';
import { View, Text } from '@/components/Themed';
import { UserContext } from '@/app/context/userContext';

interface Appointment {
    id: number;
    date: string;
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
                    const response = await fetch(`http://192.168.100.87:3000/tattoo-artist/${user.id}/appointments`);
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
        <View className="flex-1 p-2">
            <Text className="font-bold text-xl mt-1 mb-3">Appointments List</Text>
            <FlatList
                data={appointments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="p-2 my-2 dark:bg-neutral-700 rounded-lg">
                        <Text className="text-white">Date: {item.date}</Text>
                        <Text className="text-white">Client ID: {item.user_id}</Text>
                        <Text className="text-white">Time: {item.time}</Text>
                        <Text className="text-white">Description: {item.description}</Text>
                    </View>
                )}
            />
        </View>
    );
}
