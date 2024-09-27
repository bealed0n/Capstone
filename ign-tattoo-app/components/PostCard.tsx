import {
    Card,
    CardContent,
    CardImage,
    CardSubtitle,
    CardText,
    CardTitle,
} from "@/components/card";
import tailwind from "twrnc";

import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
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
                    <CardTitle>
                        @User
                    </CardTitle>
                </View>
                <CardText className="text-xs pl-10">
                    54 minutes ago, Providencia
                </CardText>
            </CardContent>
            <CardImage source={require('@/assets/images/example-45.jpg')} />
            <CardContent style={tailwind`gap-1`}>
                <CardSubtitle className="">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Do
                </CardSubtitle>
                <View >
                    <View className="flex-row">
                        <Text className="text-base pl-1 mb-1 pr-1 p rounded opacity-60 bg-slate-400 dark:bg-slate-700 dark:text-white light:" >
                            1:30H
                        </Text>
                    </View>
                    <View className="flex-row">
                        <Text className="text-base pr-1 rounded opacity-60  bg-slate-400 dark:bg-slate-700 dark:text-white">
                            $20.000
                        </Text>
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