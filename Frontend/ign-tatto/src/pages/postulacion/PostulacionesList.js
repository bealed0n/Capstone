import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Toast } from 'react-bootstrap';

const PostulacionesList = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Función para obtener las postulaciones del backend
  useEffect(() => {
    const fetchPostulaciones = async () => {
      try {
        const response = await axios.get('http://localhost:4000/getPostulaciones');
        setPostulaciones(response.data); // Guardamos las postulaciones en el estado
        setLoading(false);
      } catch (err) {
        setError('Hubo un problema al obtener las postulaciones');
        setLoading(false);
      }
    };

    fetchPostulaciones();
  }, []);

  // Función para aprobar la postulación
  const handleApprove = async (id) => {
    // Encuentra la postulación por id
    const postulacion = postulaciones.find(postulacion => postulacion.id === id);
    
    // Extraemos los datos de la postulación
    const { username, email, password, role } = postulacion; 

    try {
      const response = await axios.put(`http://localhost:4000/postulaciones/${id}/approve`, {
        username,
        email,
        password,   // Ahora también pasamos la contraseña
        role
      });

      if (response.status === 200) { // Verifica si el estado de la respuesta es 200 (OK)
        // Si la postulación es aprobada y el tatuador es registrado
        setSuccessMessage('Postulación aprobada y usuario registrado como tatuador');      
        // Actualizar la lista de postulaciones
        setPostulaciones(prevState => 
          prevState.map(postulacion => 
            postulacion.id === id ? { ...postulacion, aprobado: true } : postulacion
          )
        );
        window.location.reload(); // Recarga la página

      }
    } catch (err) {
      console.error('Error al aprobar la postulación', err);
      setError('Hubo un problema al aprobar la postulación');
    }
  };

  // Si los datos se están cargando, mostrar un spinner
  if (loading) {
    return <Spinner animation="border" variant="primary" />;
  }

  // Si ocurre un error, mostrar el mensaje de error
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2>Lista de Postulaciones</h2>

      {/* Mostrar mensaje de éxito si la postulación fue aprobada */}
      {successMessage && <Toast>{successMessage}</Toast>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre de Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Requisitos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {postulaciones.length > 0 ? (
            postulaciones.map((postulacion) => (
              <tr key={postulacion.id}>
                <td>{postulacion.id}</td>
                <td>{postulacion.username}</td>
                <td>{postulacion.email}</td>
                <td>{postulacion.role}</td>
                <td>
                  {postulacion.requisitos && postulacion.requisitos.length > 0 ? (
                    postulacion.requisitos.map((requisito, index) => (
                      <div key={index}>
                        <img
                          src={`http://localhost:4000/uploads/${requisito}`} // Asegúrate de que 'requisito' es la URL o el nombre de la imagen
                          alt={`Requisito ${index + 1}`}
                          style={{ maxWidth: '100px', marginRight: '10px' }}
                        />
                      </div>
                    ))
                  ) : (
                    <span>No hay requisitos</span>
                  )}
                </td>
                <td>
                  {/* Aprobar la postulación directamente */}
                  {!postulacion.aprobado && (
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleApprove(postulacion.id)} // Pasamos solo el id
                      
                    >
                      Aprobar
                    </button>
                  )}
                  {postulacion.aprobado && <span>Aprobado</span>}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay postulaciones disponibles</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default PostulacionesList;
