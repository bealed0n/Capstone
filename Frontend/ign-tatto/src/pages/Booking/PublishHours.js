import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const PublishHours = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/publish', {
        date,
        time
      }, { withCredentials: true });

      setSuccess('Horas publicadas exitosamente.');
      setError(null);
      setDate('');
      setTime('');
    } catch (err) {
      console.error('Error al publicar horas:', err);
      setError('Error al publicar horas. Intenta nuevamente.');
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Publicar Horas Disponibles</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handlePublish}>
        <Form.Group controlId="date" className="mb-3">
          <Form.Label>Fecha</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="time" className="mb-3">
          <Form.Label>Hora</Form.Label>
          <Form.Control
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">Publicar Horas</Button>
      </Form>
    </Container>
  );
};

export default PublishHours;