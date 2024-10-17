import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';

const CustomSearchbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';

    return (
        <View className={`flex-row items-center p-2 rounded-xl m-2 border border-gray-300 dark:border-neutral-600 shadow-sm h-12 dark:bg-neutral-900`}>
            <Ionicons name="search" size={22} color={iconColor} className="text-gray-500" />
            <TextInput
                className={`flex-1 text-lg font-medium ml-2 dark:text-neutral-100`} // Usamos className de NativeWind
                placeholder="Search"
                placeholderTextColor={colorScheme === 'dark' ? '#919191' : '#A0A0A0'} // Placeholder dinámico
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
    );
};

export default CustomSearchbar;
