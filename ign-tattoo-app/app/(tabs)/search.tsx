import { View, Text } from '@/components/Themed';
import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';

export default function SearchScreen() {
    return (
        <View className="flex-1 flex items-center justify-center">
            <Text className="text-red-600">color rojo xdacor</Text>
            <EditScreenInfo path="app/(tabs)/search.tsx" />
        </View>
    )
}