import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';
import { Href, router } from 'expo-router';

const SERVER_URL = 'http://192.168.100.87:3000';

interface User {
    id: number;
    username: string;
    profile_pic: string;
    role: string;
}

const CustomSearchbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const colorScheme = useColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setUsers([]);
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch(`${SERVER_URL}/search/users?query=${searchQuery}`);
                const data = await response.json();
                setUsers(data.users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [searchQuery]);

    return (
        <View className="flex-1 p-4">
            <View className={`flex-row items-center p-2 rounded-xl m-2 border border-gray-300 dark:border-neutral-600 shadow-sm h-12 dark:bg-neutral-900`}>
                <Ionicons name="search" size={22} color={iconColor} className="text-gray-500" />
                <TextInput
                    className={`flex-1 text-lg font-medium ml-2 dark:text-neutral-100`}
                    placeholder="Search"
                    placeholderTextColor={colorScheme === 'dark' ? '#919191' : '#A0A0A0'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => router.push(`/(tabs)/profile/${item.id}` as Href)}>
                        <View className="flex-row items-center p-2 border-b border-gray-300 dark:border-neutral-600">
                            <Image
                                source={item.profile_pic ? { uri: `${SERVER_URL}${item.profile_pic}` } : require('@/assets/images/user.png')}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <View>
                                <Text className="text-base font-bold dark:text-white">@{item.username}</Text>
                                <Text className="text-sm text-gray-500">{item.role}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default CustomSearchbar;