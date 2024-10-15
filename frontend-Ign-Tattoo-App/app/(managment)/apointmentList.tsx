// app/management/appointmentsList.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const dummyAppointments = [
    { id: '1', date: '2024-10-15', client: 'John Doe', time: '10:00 AM' },
    { id: '2', date: '2024-10-16', client: 'Jane Smith', time: '02:00 PM' },
    { id: '3', date: '2024-10-17', client: 'Michael Johnson', time: '09:00 AM' },
];

export default function AppointmentsList() {
    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 10 }}>Appointments List</Text>
            <FlatList
                data={dummyAppointments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.appointmentItem}>
                        <Text>Date: {item.date}</Text>
                        <Text>Client: {item.client}</Text>
                        <Text>Time: {item.time}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    appointmentItem: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
});
