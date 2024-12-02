import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AddModel = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (model) {
      formData.append('model', model);
    }

    try {
      await axios.post('http://localhost:4000/models', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });
      navigate('/models');
    } catch (err) {
      console.error('Error al agregar modelo 3D:', err.response?.data || err.message);
      setError('No se pudo agregar el modelo 3D');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Agregar Modelo 3D</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="description" className="mt-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="model" className="mt-3">
          <Form.Label>Archivo del Modelo 3D (ZIP)</Form.Label>
          <Form.Control
            type="file"
            accept=".zip"
            onChange={(e) => setModel(e.target.files[0])}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Agregar Modelo
        </Button>
      </Form>
    </Container>
  );
};

export default AddModel;