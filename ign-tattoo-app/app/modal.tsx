import EditScreenInfo from '@/components/EditScreenInfo';
import React, { useEffect, useState } from 'react';
import { Text, View } from '@/components/Themed';
import axios from 'axios';

const app = () => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    axios.get('http://192.168.100.87:3000/')
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <View>
      <Text>{message}</Text>
    </View>
  );

}

export default app;


