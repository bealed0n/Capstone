import React from 'react';
import { View, Text } from '@/components/Themed';
import { Image } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

export default function Messages() {
    return (
        <StyledView className="flex-row p-2 mx-3 my-2 shadow-lg mb-4 rounded-lg">
            <StyledImage
                source={{ uri: 'https://gravatar.com/avatar/HASH' }}
                className="w-10 h-10 rounded-full mr-4"
            />
            <StyledView className="flex-1">
                <StyledText className="font-bold mb-1">Nombre</StyledText>
                <StyledText className="mb-1">Contenido del mensaje</StyledText>
                <StyledText className="text-xs text-gray-500">Hora</StyledText>
            </StyledView>
        </StyledView>
    );
}