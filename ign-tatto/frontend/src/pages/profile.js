// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);  // Estado para almacenar los datos del usuario
  const [loading, setLoading] = useState(true);  // Estado para mostrar el estado de carga
  const [error, setError] = useState(null);  // Estado para manejar errores

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');  // Obtener el token desde el almacenamiento local
        const response = await axios.get('/auth/profile', {
          headers: {
            'x-auth-token': token,  // Enviar el token en los encabezados
          },
        });
        setUser(response.data);  // Establecer los datos del usuario en el estado
        setLoading(false);  // Desactivar el estado de carga
      } catch (error) {
        setError('Error al obtener el perfil');
        setLoading(false);
      }
    };

    fetchUserProfile();  // Llamar a la función para obtener el perfil cuando el componente se cargue
  }, []);

  if (loading) {
    return <div>Cargando...</div>;  // Mostrar un mensaje de carga mientras se obtienen los datos
  }

  if (error) {
    return <div>{error}</div>;  // Mostrar un mensaje de error si algo falla
  }

  return (
    <div className="container mt-5">
      <h2>Perfil del Usuario</h2>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Nombre de Usuario: {user.username}</h5>
          <p className="card-text">Correo Electrónico: {user.email}</p>
          <p className="card-text">Rol: {user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
