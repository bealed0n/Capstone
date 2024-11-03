import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SERVER_URL = 'http://192.168.100.87:3000'; // Cambia esto a la URL de tu servidor

interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    username: string;
    content: string;
    created_at: string;
}

interface CommentsModalProps {
    postId: number;
    userId: number;
    visible: boolean;
    onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ postId, userId, visible, onClose }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>('');

    useEffect(() => {
        if (visible) {
            fetchComments();
        }
    }, [visible]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/posts/${postId}/comments`);
            const data = await response.json();
            setComments(data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim() === '') return;

        try {
            const response = await fetch(`${SERVER_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, content: newComment }),
            });

            const result = await response.json();

            if (result.success) {
                setComments([...comments, result.comment]);
                setNewComment('');
            } else {
                console.error('Error adding comment:', result.message);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Comments</Text>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialIcons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.commentContainer}>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.comment}>{item.content}</Text>
                            <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
                        </View>
                    )}
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChangeText={setNewComment}
                    />
                    <TouchableOpacity onPress={handleAddComment}>
                        <MaterialIcons name="send" size={24} color="blue" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    commentContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    username: {
        fontWeight: 'bold',
    },
    comment: {
        marginTop: 4,
    },
    timestamp: {
        marginTop: 4,
        fontSize: 12,
        color: '#888',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    input: {
        flex: 1,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginRight: 8,
    },
});

export default CommentsModal;