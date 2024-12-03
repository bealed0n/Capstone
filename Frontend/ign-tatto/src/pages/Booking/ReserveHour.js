// src/pages/Booking/ReserveHour.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import './ReserveHour.css';

const ReserveHour = ({ artistId, artistName }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Función para formatear fecha y hora
  const formatDateTime = (date, time) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString(undefined, options);
    return `${formattedDate} a las ${time}`;
  };

  // Obtener horas disponibles del artista
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:4000/artist/${artistId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          withCredentials: true,
        });
        setAvailableSlots(response.data);
      } catch (err) {
        console.error('Error al obtener las horas disponibles:', err);
        setError('Error al obtener las horas disponibles.');
      } finally {
        setLoadingSlots(false);
      }
    };

    if (artistId) {
      fetchAvailableSlots();
    }
  }, [artistId]);

  // Manejar la reserva de una hora
  const handleReserve = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setReserving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`http://localhost:4000/book`, {
        slotId: selectedSlot,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true,
      });
      setSuccess('Hora reservada exitosamente.');
      // Actualizar las horas disponibles eliminando el slot reservado
      setAvailableSlots(availableSlots.filter((slot) => slot.id !== selectedSlot));
      setSelectedSlot('');
    } catch (err) {
      console.error('Error al reservar la hora:', err);
      setError('Error al reservar la hora. Intenta nuevamente.');
    } finally {
      setReserving(false);
    }
  };

  return (
    <Form onSubmit={handleReserve}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form.Group controlId="artistName" className="mb-3">
        <Form.Label>Nombre del Tatuador</Form.Label>
        <Form.Control
          type="text"
          value={artistName}
          readOnly
        />
      </Form.Group>

      {loadingSlots ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando horas disponibles...</span>
        </Spinner>
      ) : availableSlots.length > 0 ? (
        <Form.Group controlId="selectedSlot" className="mb-3">
          <Form.Label>Selecciona una hora disponible:</Form.Label>
          <Form.Control
            as="select"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
          >
            <option value="">-- Selecciona una hora --</option>
            {availableSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {formatDateTime(slot.date, slot.time)}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      ) : (
        <p>No hay horas disponibles para este tatuador.</p>
      )}

      <Button variant="primary" type="submit" disabled={!selectedSlot || reserving}>
        {reserving ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />{' '}
            Reservando...
          </>
        ) : (
          'Reservar Hora'
        )}
      </Button>
    </Form>
  );
};

export default ReserveHour;