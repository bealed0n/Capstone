// src/utils/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',  // Tu backend
  withCredentials: true,  // Esto es necesario para enviar cookies (como el token)
});

export default axiosInstance;
