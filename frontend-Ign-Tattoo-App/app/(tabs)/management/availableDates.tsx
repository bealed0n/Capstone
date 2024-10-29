import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router'; // Cambia aquí
import { useRoute } from '@react-navigation/native'; // Cambia aquí

export default function AvailableDates() {
    const route = useRoute(); // Usa useRoute para obtener la información de la ruta
    const { id } = route.params as { id: string }; // Accede a los parámetros directamente

    const [availability, setAvailability] = useState<{ id: number; date: string; start_time: string; end_time: string; description: string; }[]>([]);

    useEffect(() => {
        if (typeof id === 'string') {
            fetch(`http://192.168.100.87:3000/tattoo-artist/${id}/availability`)
                .then((response) => response.json())
                .then((data) => setAvailability(data.availability))
                .catch((error) => console.error('Error fetching availability:', error));
        } else {
            console.warn('ID no válido:', id);
        }
    }, [id]);

    return (
        <View>
            <Text className="text-lg font-bold">Available Dates</Text>
            <FlatList
                data={availability}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="p-2 my-1 border-b border-gray-300">
                        <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
                        <Text>Start Time: {item.start_time}</Text>
                        <Text>End Time: {item.end_time}</Text>
                        <Text>Description: {item.description}</Text>
                    </View>
                )}
            />
        </View>
    );
}
