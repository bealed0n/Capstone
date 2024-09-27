import { StyleSheet } from 'react-native';
import Profile from '@/components/Profile';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function ProfileScreen() {
  return (
    <View className="flex-1 flex items-center justify-center">
      <Profile />
    </View>
  );
}