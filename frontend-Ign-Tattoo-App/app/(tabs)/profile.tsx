import { StyleSheet } from 'react-native';
import Profile from '@/components/Profile';
import { Text, View } from '@/components/Themed';
import { useContext } from 'react';
import { UserContext } from '../context/userContext';
import UserProfile from '@/components/UserProfile';

export default function ProfileScreen() {
  const { user } = useContext(UserContext);
  return (
    <View>
      {user?.role === 'user' ? (
        <UserProfile />
      ) : (
        <Profile />
      )}


    </View>
  );
}