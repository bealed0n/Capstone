import { StyleSheet } from 'react-native';

import PrincipalSettings from '@/components/principalSettings';
import { Text, View } from '@/components/Themed';

export default function ProfileConfig() {
    return (
        <View className='flex-1 items-start'>
            <PrincipalSettings path='app/profileConfig.tsx' />
        </View>
    );
}