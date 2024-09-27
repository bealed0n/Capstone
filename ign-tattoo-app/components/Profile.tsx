import { Image } from 'react-native';
import React from 'react';
import { Text, View } from '../components/Themed';

export default function Profile() {
    return (
        <View>
            <View className="">
                <Image source={require('../assets/images/user.png')} className="flex items-start w-20 h-20 rounded-full" />
            </View>

        </View>


    );
}