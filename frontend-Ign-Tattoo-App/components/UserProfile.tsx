import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed'; // Asegúrate de que este componente esté bien configurado
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import EditScreenInfo from './EditScreenInfo';
import { UserContext } from '@/app/context/userContext';

export default function UserProfile() {
    const navigation = useNavigation();
    const { user } = useContext(UserContext);

    return (
        <View>
            <View className='ml-5'>
                <Text className='font-bold text-lg'>
                    {user?.username ?? 'No encontrado'}
                </Text>
            </View>
            <View className='mb-1'>
                <Text className='font-bold text-xl text-center mb-4'>
                    Dashboard
                </Text>
                <View className='flex-row justify-center mt-2'>
                    <TouchableOpacity className='flex-1 mx-5'
                        onPress={() => {
                            router.push('/(tabs)/management/calendar' as Href);
                        }}
                    >
                        <Text className='text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md'>
                            Calendar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className='flex-1 mx-5'
                        onPress={() => {
                            router.push('/(tabs)/management/apointmentList' as Href);
                        }}
                    >
                        <Text className='text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md'>
                            Appointments
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className=" mt-4 mb-2 h-0.5 border-t-0 bg-neutral-200 dark:bg-white/10" />
            <View>
                <Text className='font-bold text-center text-lg'>
                    My tattoos
                </Text>
                <EditScreenInfo path="/screens/UserProfile.tsx" />
            </View>
        </View>
    );
}
