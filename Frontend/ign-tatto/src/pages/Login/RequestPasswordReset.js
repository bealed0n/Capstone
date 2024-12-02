import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:4000/request-password-reset', { email });
      setSuccess(response.data.msg);
      setError(null);
    } catch (err) {
      setError('Error al solicitar el restablecimiento de la contraseña');
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Solicitar Restablecimiento de Contraseña</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="email">
          <Form.Label>Correo Electrónico</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Solicitar Restablecimiento
        </Button>
      </Form>
    </Container>
  );
};

export default RequestPasswordReset;