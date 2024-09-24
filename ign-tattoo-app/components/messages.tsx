import React from 'react';
import { View, Text } from '@/components/Themed';
import { Image } from 'react-native';
import { styled } from 'nativewind';

const StyledImage = styled(Image);

export default function Messages() {
    return (
        <View className="flex-row p-2 mx-3 my-2 shadow-lg mb-4 rounded-lg" darkColor='#333333' >
            <StyledImage
                source={{ uri: 'https://instagram.fscl35-1.fna.fbcdn.net/v/t51.2885-19/455916260_1061228062016838_1577253358058853466_n.jpg?stp=dst-jpg_s150x150&_nc_ht=instagram.fscl35-1.fna.fbcdn.net&_nc_cat=106&_nc_ohc=cokI5aPd4n8Q7kNvgF7VoDW&_nc_gid=0d5142dcccd048cb87a7cb9a60c9b9ac&edm=AFDWGO4BAAAA&ccb=7-5&oh=00_AYCh32nryzmn6fLKeVOfWRv0_VyN8yECtSTAjumWf0pnDg&oe=66F90409&_nc_sid=7b9ede' }}
                className="w-10 h-10 rounded-full mr-4"
            />
            <View className="flex-1" darkColor='#333333'>
                <Text className="font-bold mb-1" >Haegeum._</Text>
                <Text className="mb-1">QUE BKN</Text>
                <Text className="text-xs text-gray-500">20:30</Text>
            </View>
        </View>
    );
}