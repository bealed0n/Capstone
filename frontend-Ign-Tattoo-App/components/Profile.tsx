import { Image, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import { Text, View, } from './Themed';
import { UserContext } from '@/app/context/userContext';
import { Href, router } from 'expo-router';


export default function Profile() {

    const { user } = useContext(UserContext);
    const user2 = {
        name: 'John Doe',
        photo: require('../assets/images/user.png'),
        email: '',
        tattoos: '30',
        followers: '100',
        following: '200',
    }

    return (
        <View>
            <View className="flex-row">
                <Image source={user2.photo} className='rounded-full w-20 h-20 items-start mt-4 ml-3' />
                <View className="flex-col ml-3 mt-4  ">
                    <Text className='text-xl font-bold'>{user?.username ?? 'No encontrado'}</Text>
                    <View className='flex-row'>
                        <Text className='text-sm mt-1'>{user2.tattoos} tattoos</Text>
                        <Text className='text-sm mt-1 ml-3'>{user2.followers} followers</Text>
                        <Text className='text-sm mt-1 ml-3'>{user2.following} following</Text>
                    </View>
                </View>
            </View>

            <View>
                <Text className='text-base mt-4 ml-5 opacity-50'>Dashboard</Text>
                <View className='flex-row justify-center mt-2'>
                    <TouchableOpacity className='flex-1 mx-5'
                        onPress={() => {
                            router.push('/(managment)/calendar' as Href);
                        }}
                    >
                        <Text className='text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md'>
                            Calendar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className='flex-1 mx-5'
                        onPress={() => {
                            router.push('/(managment)/apointmentList' as Href);
                        }}
                    >
                        <Text className='text-lg text-neutral-800 p-2 bg-neutral-200 text-center dark:bg-neutral-500 dark:text-neutral-50 rounded-md'>
                            Appointments
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className=" mt-4 h-0.5 border-t-0 bg-neutral-200 dark:bg-white/10" />

        </View>
    );
}