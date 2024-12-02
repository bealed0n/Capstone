// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Reemplaza con la URL de tu backend

export default socket;