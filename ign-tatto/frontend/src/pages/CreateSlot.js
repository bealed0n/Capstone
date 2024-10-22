import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateSlot = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        return;
      }

      const response = await axios.post('http://localhost:5000/bookings/create', { date, time }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setSuccess('Hora disponible creada exitosamente.');
      setError(null);
    } catch (error) {
      console.error('Error al crear hora disponible:', error);
      setError('Error al crear hora disponible.');
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center">Crear Hora Disponible</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleCreateSlot}>
        <Form.Group controlId="formDate">
          <Form.Label>Fecha:</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formTime" className="mt-3">
          <Form.Label>Hora:</Form.Label>
          <Form.Control
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Crear
        </Button>
      </Form>
    </Container>
  );
};

export default CreateSlot;