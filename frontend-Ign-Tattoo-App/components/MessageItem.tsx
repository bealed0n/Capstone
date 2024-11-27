import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { SERVER_URL } from "@/constants/constants";

interface Message {
  sender_id: number;
  sender_profile_pic?: string;
  content?: string;
  image_url?: string;
  sent_at: string;
}

interface MessageItemProps {
  item: Message;
  isUserMessage: boolean;
  onImagePress: (imageUrl: string) => void;
  userProfilePic: string;
}

const MessageItem = memo(
  ({ item, isUserMessage, onImagePress, userProfilePic }: MessageItemProps) => {
    const profilePicUrl = isUserMessage
      ? userProfilePic
      : item.sender_profile_pic
        ? `${SERVER_URL}${item.sender_profile_pic}`
        : "https://via.placeholder.com/40";

    return (
      <View
        className={`flex-row items-start my-2 ${
          isUserMessage ? "justify-end" : "justify-start"
        }`}
      >
        {!isUserMessage && (
          <Image
            source={{ uri: profilePicUrl }}
            className="w-8 h-8 rounded-full ml-2"
          />
        )}
        <View
          className={`p-3 rounded-lg shadow-sm ${
            isUserMessage ? "bg-blue-500 mr-3" : "bg-neutral-500 ml-3"
          } max-w-[75%]`}
        >
          {item.content ? (
            <Text className="text-white font-medium">{item.content}</Text>
          ) : null}
          {item.image_url ? (
            <TouchableOpacity onPress={() => onImagePress(item.image_url!)}>
              <Image
                source={{
                  uri: item.image_url.startsWith("data:")
                    ? item.image_url
                    : `${SERVER_URL}${item.image_url}`,
                }}
                className="w-64 h-64 rounded-lg mt-2"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : null}
          <Text className="text-xs text-gray-200 mt-1 text-right">
            {format(new Date(item.sent_at), "HH:mm")}
          </Text>
        </View>
        {isUserMessage && (
          <Image
            source={{ uri: profilePicUrl }}
            className="w-8 h-8 rounded-full mr-1"
          />
        )}
      </View>
    );
  }
);

export default MessageItem;
