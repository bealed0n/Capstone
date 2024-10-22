import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No se encontró el token de autenticación.');
          setLoading(false);
          return;
        }

        console.log('Token:', token);  // Log the token to verify it's being retrieved correctly

        const response = await axios.get('http://localhost:5000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);  // Log the error for debugging
        if (error.response && error.response.status === 401) {
          setError('No autorizado. Por favor, inicia sesión nuevamente.');
        } else {
          setError('Error al obtener el perfil');
        }
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    // Eliminar el token de autenticación del almacenamiento local
    localStorage.removeItem('token');
    // Redirigir al usuario a la página de inicio de sesión
    navigate('/login');
  };

  if (loading) return <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h1 className="text-center">Perfil del Usuario</h1>
      {user && (
        <Card className="mt-3">
          <Card.Body>
            <Card.Title>{user.username}</Card.Title>
            <Card.Text>
              <strong>Email:</strong> {user.email}
            </Card.Text>
            <Card.Text>
              <strong>Rol:</strong> {user.role}
            </Card.Text>
            <Button variant="danger" onClick={handleLogout} className="mt-3">
              Cerrar Sesión
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Profile;