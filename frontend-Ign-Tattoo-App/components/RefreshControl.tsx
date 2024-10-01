
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
} from 'react-native';

import React, { ReactNode } from 'react';

interface RefreshControlCompProps {
    children: ReactNode;
}

const RefreshControlComp: React.FC<RefreshControlCompProps> = ({ children }) => {
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                {children}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default RefreshControlComp;