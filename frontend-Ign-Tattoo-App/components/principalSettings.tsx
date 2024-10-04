import { View, Text } from '../components/Themed';
import { TouchableOpacity } from 'react-native';

export default function principalSettings({ path }: { path: string }) {
    return (
        <View className='flex-1 flex-col '>

            <Text className='text-neutral-600 ml-4 mt-2'>Sesion</Text>

            <TouchableOpacity
                className='pr-80'

            >
                <Text className='text-base ml-4 mt-2'>Log out</Text>
            </TouchableOpacity>
        </View>
    );
}