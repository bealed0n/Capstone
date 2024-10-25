import React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { Divider } from '@rneui/themed';
import Messages from '@/components/messages';
import RefreshControlComp from '@/components/RefreshControl'; // Importamos el componente

export default function IndexScreen() {
    const onRefresh = async () => {
        setRefreshing(true);
        setRefreshing(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <RefreshControlComp>
                <View style={styles.content}>
                    <Messages />
                </View>
            </RefreshControlComp>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15,
    },
});

function setRefreshing(arg0: boolean) {
    throw new Error('Function not implemented.');
}
