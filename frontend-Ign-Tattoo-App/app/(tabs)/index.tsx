import React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import PostCard from '@/components/PostCard';
import RefreshControlComp from '@/components/RefreshControl';

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <RefreshControlComp>
        <View style={styles.content}>
          <PostCard />
          <View style={styles.separator} />
          <EditScreenInfo path="app/(tabs)/index.tsx" />
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});