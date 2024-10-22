import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container } from 'react-bootstrap';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('image', image);

      const response = await axios.post('http://localhost:5000/products/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Producto agregado exitosamente.');
      setError(null);
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setError('Error al agregar producto.');
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center">Agregar Producto</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleAddProduct}>
        <Form.Group controlId="formName">
          <Form.Label>Nombre:</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formDescription" className="mt-3">
          <Form.Label>Descripción:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formPrice" className="mt-3">
          <Form.Label>Precio:</Form.Label>
          <Form.Control
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formImage" className="mt-3">
          <Form.Label>Imagen:</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Agregar
        </Button>
      </Form>
    </Container>
  );
};

export default AddProduct;