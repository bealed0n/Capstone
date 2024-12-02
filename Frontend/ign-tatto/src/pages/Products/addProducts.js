// frontend/src/components/AddProduct.js
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


const AddProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(''); // Añadido stock
  const [category, setCategory] = useState('');
  const [imageUrl, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const categories = [
    'cartuchos',
    'maquinas',
    'cuidado',
    'insumos',
    'tintas',
    'otros'
  ];

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock); // Añadido stock
      formData.append('category', category);
      if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const response = await axios.post('http://localhost:4000/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      console.log('Producto agregado:', response.data);

      setSuccess('Producto agregado exitosamente.');
      setError(null);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory('');
      setImage(null);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setError('Error al agregar producto. Intenta nuevamente.');
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
            required
          />
        </Form.Group>
        <Form.Group controlId="formDescription" className="mt-3">
          <Form.Label>Descripción:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formPrice" className="mt-3">
          <Form.Label>Precio:</Form.Label>
          <Form.Control
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formStock" className="mt-3">
          <Form.Label>Stock:</Form.Label>
          <Form.Control
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        {/* Selector de Categoría */}
        <Form.Group controlId="category" className="mb-3">
          <Form.Label>Categoría</Form.Label>
          <Form.Control
            as="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        </Form.Group>
        <Form.Group controlId="formImage" className="mt-3">
          <Form.Label>Imagen:</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            required
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