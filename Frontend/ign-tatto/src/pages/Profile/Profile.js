// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Obtener el perfil del usuario
  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:4000/profile', {
        withCredentials: true,  // Asegura que se envíen las cookies
      });
      setUser(response.data);  // Guarda los datos del perfil
    } catch (err) {
      console.error('Error al obtener el perfil:', err.response?.data || err.message);
      setError('No se pudo obtener el perfil');
    }
  };

  // Función para cerrar sesión
    // Función para cerrar sesión
    const handleLogout = () => {
      // Eliminar la cookie
      Cookies.remove('token');
      // Redirigir al login
      navigate('/login');
    };

  // Llamar a la función al montar el componente
  useEffect(() => {
    fetchProfile();
  }, []);  // Solo se ejecuta una vez al cargar el componente

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="text-center">Perfil de Usuario</h2>
              
              {error && <div className="alert alert-danger">{error}</div>} {/* Mostrar mensaje de error */}

              {user ? (
                <div>
                  <h4>Bienvenido, {user.username}</h4>
                  <p>Email: {user.email}</p>
                  <button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
                </div>
              ) : (
                <div>Cargando perfil...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
