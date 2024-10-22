import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, ListGroup, Button, Alert } from 'react-bootstrap';
import { format } from 'date-fns';

const ReserveSlot = () => {
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get('http://localhost:5000/bookings/available-slots');
        if (Array.isArray(response.data)) {
          setSlots(response.data);
        } else {
          console.error('La respuesta no es un array:', response.data);
          setError('Error al obtener horas disponibles.');
        }
      } catch (error) {
        console.error('Error al obtener horas disponibles:', error);
        setError('Error al obtener horas disponibles.');
      }
    };

    fetchSlots();
  }, []);

  const handleReserveSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        return;
      }

      const response = await axios.post('http://localhost:5000/bookings/reserve', { slot_id: slotId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setSuccess('Hora reservada exitosamente.');
      setError(null);
    } catch (error) {
      console.error('Error al reservar hora:', error);
      setError('Error al reservar hora.');
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center">Reservar Hora</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <ListGroup>
        {slots.map(slot => (
          <ListGroup.Item key={slot.id} className="d-flex justify-content-between align-items-center">
            <div>
              {format(new Date(slot.date), 'yyyy-MM-dd')} {slot.time} - {slot.username}
            </div>
            <Button variant="primary" onClick={() => handleReserveSlot(slot.id)}>Reservar</Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default ReserveSlot;