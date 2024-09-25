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


export const CardExample = () => {
    return (
        <Card style={tailwind`max-h-176 w-full max-w-90`}>
            <CardContent style={tailwind`gap-1`}>
                <CardTitle>@Usuario</CardTitle>
                <CardText>2 hours ago, Providencia</CardText>
            </CardContent>
            <CardImage source={{ uri: "https://scontent.cdninstagram.com/v/t51.2885-15/367509944_257082523945379_7087897595348827347_n.jpg?stp=dst-jpg_e15&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4ODk5LnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent.cdninstagram.com&_nc_cat=111&_nc_ohc=aExThvQFa_4Q7kNvgGGkmUc&_nc_gid=b258dce740314ee3b2473274a6bdcd1b&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzE3MDEyNjgyOTQwNzE2NzUxMQ%3D%3D.3-ccb7-5&oh=00_AYA3Ia0sQs12JX7C2hu98qWrSu3elPx9mJX1PbFnJc8mUw&oe=66EAA320&_nc_sid=10d13b" }} />
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