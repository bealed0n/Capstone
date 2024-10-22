import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, ListGroup, Alert } from 'react-bootstrap';
import { format } from 'date-fns';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No se encontró el token de autenticación.');
          return;
        }

        const response = await axios.get('http://localhost:5000/bookings/my-reservations', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setReservations(response.data);
        } else {
          console.error('La respuesta no es un array:', response.data);
          setError('Error al obtener reservas.');
        }
      } catch (error) {
        console.error('Error al obtener reservas:', error);
        setError('Error al obtener reservas.');
      }
    };

    fetchReservations();
  }, []);

  return (
    <Container className="mt-5">
      <h1 className="text-center">Mis Reservas</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <ListGroup>
        {reservations.map(reservation => (
          <ListGroup.Item key={reservation.id} className="d-flex justify-content-between align-items-center">
            <div>
              {format(new Date(reservation.date), 'yyyy-MM-dd')} {reservation.time} - {reservation.username}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default MyReservations;