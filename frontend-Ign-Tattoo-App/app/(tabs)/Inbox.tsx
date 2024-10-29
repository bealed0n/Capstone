import React from 'react';
import { SafeAreaView, View } from 'react-native';
import Messages from '@/components/messages';

export default function IndexScreen() {
    return (
        <SafeAreaView >
            <View>
                <Messages />
            </View>
        </SafeAreaView>
    );
}
