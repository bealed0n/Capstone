import React from 'react';
import { SafeAreaView, View } from 'react-native';
import Messages from '@/components/messages';

export default function InboxScreen() {
    return (
        <SafeAreaView>
            <View>
                <Messages />
            </View>
        </SafeAreaView>
    );
}