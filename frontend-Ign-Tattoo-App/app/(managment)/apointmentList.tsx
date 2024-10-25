import React from 'react';
import { FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text } from '@/components/Themed';


const dummyAppointments = [
    { id: '1', date: '2024-10-15', client: 'John Doe', time: '10:00 AM' },
    { id: '2', date: '2024-10-16', client: 'Jane Smith', time: '02:00 PM' },
    { id: '3', date: '2024-10-17', client: 'Michael Johnson', time: '09:00 AM' },
];

export default function AppointmentsList() {
    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';
    return (
        <View className='flex-1 p-2' >
            <Text className='font-bold text-xl mt-1 mb-3'>Appointments List</Text>
            <FlatList
                data={dummyAppointments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className='p-2 my-2 dark:bg-neutral-700 rounded-lg' >
                        <Text className='text-white'>Date: {item.date}</Text>
                        <Text className='text-white' >Client: {item.client}</Text>
                        <Text className='text-white'>Time: {item.time}</Text>

                    </View>
                )}
            />
        </View>
    );
}

