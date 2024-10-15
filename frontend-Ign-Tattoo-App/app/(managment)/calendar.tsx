// app/management/calendar.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarView() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Appointments Calendar</Text>
            <Calendar
                // Puedes personalizar la configuración del calendario aquí
                markedDates={{
                    '2024-10-15': { selected: true, marked: true, dotColor: 'red' },
                    '2024-10-20': { marked: true, dotColor: 'blue' },
                }}
                onDayPress={(day: any) => {
                    console.log('selected day', day);
                }}
            />
        </View>
    );
}
