import {
    Card,
    CardContent,
    CardImage,
    CardSubtitle,
    CardText,
    CardTitle,
} from "@/components/card";
import tailwind from "twrnc";

import colors from "@/constants/Colors";

import { View, Text } from "@/components/Themed";
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';


export const CardExample = () => {
    return (
        <Card style={tailwind`max-h-176 w-full max-w-90`}>
            <CardContent className="p-3">
                <View className="flex-row items-center">
                    <Image
                        source={require('@/assets/images/user.png')}
                        style={tailwind`w-8 h-8 rounded-full mr-2`}
                    />
                    <CardTitle>@User</CardTitle>
                </View>

                <CardText className="text-xs pl-10 dark:bg-slate-400">54 minutes ago, Providencia</CardText>
            </CardContent>
            <CardImage source={require('@/assets/images/example-45.jpg')} />
            <CardContent style={tailwind`gap-1`}>
                <CardSubtitle>Descripcion</CardSubtitle>

                <View className="flex-row ">
                    <View className="pr-8">
                        <Text className="text-right text-base">1:30H</Text>
                    </View>
                    <View>
                        <Text className="text-right text-base">$20.000</Text>
                    </View>
                </View>
            </CardContent>
        </Card>
    );
};

export default function PostCard() {
    return (
        <CardExample />
    );
}