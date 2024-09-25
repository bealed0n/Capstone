import React from 'react';
import { View, Text } from '@/components/Themed';
import { Image } from 'react-native';
import { styled } from 'nativewind';

const StyledImage = styled(Image);

export default function Messages() {
    return (
        <View className="flex-row p-2 mx-3 my-2 shadow-lg mb-4 rounded-lg" darkColor='#333333' >
            <StyledImage
                source={require('@/assets/images/user.png')}
                className="w-10 h-10 rounded-full mr-4"
            />
            <View className="flex-1" darkColor='#333333'>
                <Text className="font-bold mb-1" >User</Text>
                <Text className="mb-1">Message</Text>
                <Text className="text-xs text-gray-500">Time stamp message </Text>
            </View>
        </View>
    );
}