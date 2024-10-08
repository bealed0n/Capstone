import { useState } from 'react';
import { TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { View, Text } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePost() {
    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null); // Para almacenar la URI de la imagen seleccionada
    const router = useRouter();

    // Función para seleccionar imagen desde la galería
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permiso requerido', 'Se requiere permiso para acceder a tu galería');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri); // Guardar la URI de la imagen seleccionada
        }
    };

    // Función para convertir la imagen a Blob
    const createBlobFromUri = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log("Blob creado:", blob); // Agregar un log
        return blob;
    };

    const handleSubmit = async () => {
        if (!content) {
            Alert.alert('Error', 'El contenido del post no puede estar vacío');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('content', content);

            if (imageUri) {
                const image = {
                    uri: imageUri,
                    name: 'post-image.jpg', // Nombre del archivo
                    type: 'image/jpeg', // Tipo MIME (ajústalo según la imagen seleccionada)
                } as any;

                formData.append('image', image); // Adjuntar la imagen como un archivo
            }

            const response = await fetch('http://192.168.100.87:3000/posts', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json', // Aceptar JSON en la respuesta
                    // No incluir 'Content-Type', fetch lo define automáticamente cuando usas FormData
                },
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                console.log('Respuesta del servidor:', jsonResponse); // Agregar log
                Alert.alert('Post creado', 'Tu post ha sido creado con éxito');
                router.replace('/(tabs)');
            } else {
                const errorResponse = await response.json();
                console.error('Error en la respuesta del servidor:', errorResponse); // Agregar log
                Alert.alert('Error', 'No se pudo crear el post');
            }
        } catch (error) {
            console.error('Error creando el post:', error);
            Alert.alert('Error', 'Hubo un problema al conectarse al servidor');
        }
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={20} // Ajusta según sea necesario
        >
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-2xl font-bold mb-4">Crear Post</Text>

                {/* Muestra la imagen seleccionada si existe */}
                {imageUri ? (
                    <Image source={{ uri: imageUri }} className="w-full h-60 mb-4 rounded" />
                ) : (
                    <TouchableOpacity className="bg-gray-200 p-3 rounded mb-4 w-full" onPress={pickImage}>
                        <Text className="text-center text-gray-500">Seleccionar imagen</Text>
                    </TouchableOpacity>
                )}

                <TextInput
                    className="border border-gray-300 rounded p-2 w-full mb-4 dark:text-white"
                    placeholder="Escribe tu post aquí..."
                    value={content}
                    onChangeText={setContent}
                    multiline
                />

                <TouchableOpacity
                    className="bg-blue-500 p-3 rounded w-full"
                    onPress={handleSubmit}
                >
                    <Text className="text-white text-center">Publicar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
