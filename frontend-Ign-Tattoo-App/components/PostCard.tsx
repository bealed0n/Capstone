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
import { StyleSheet, Image } from 'react-native';

interface CardExampleProps {
    username: string;
    content: string;
    image: string;
    createdAt: string;
}

interface Post {
    username: string;
    content: string;
    image: string;
    created_at: string;
}

const SERVER_URL = 'http://192.168.100.87:3000'; // Cambia esto a la URL de tu servidor

export const CardExample = ({ username, content, image, createdAt }: CardExampleProps) => {
    const imageUrl = image ? `${SERVER_URL}${image}` : null;

    return (
        <Card style={tailwind`max-h-176 h-170 w-90 max-w-90 my-2`}>
            <CardContent className="p-3">
                <View className="flex-row items-center">
                    <Image
                        source={require('@/assets/images/user.png')}
                        style={tailwind`w-8 h-8 rounded-full mr-2`}
                    />
                    <CardTitle>
                        @{username}
                    </CardTitle>
                </View>
                <CardText className="text-xs pl-10">
                    {new Date(createdAt).toLocaleString()}
                </CardText>
            </CardContent>
            {imageUrl && <CardImage
                source={{ uri: imageUrl }} />}
            <CardContent style={tailwind`gap-1`}>
                <CardSubtitle className="">
                    {content}
                </CardSubtitle>

            </CardContent>
        </Card>
    );
};

export default function PostCard({ post }: { post: Post }) {
    return (
        <CardExample
            username={post.username}
            content={post.content}
            image={post.image}
            createdAt={post.created_at}
        />
    );
}