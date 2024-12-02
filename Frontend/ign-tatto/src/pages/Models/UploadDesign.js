import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container } from 'react-bootstrap';

const AddDesign = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [style, setStyle] = useState(''); // Estado para manejar el estilo
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAddDesign = async (e) => {
    e.preventDefault();

    if (!image) {
      setError('Por favor, selecciona una imagen.');
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('image', image);
    formData.append('estilo', style); // Añadir el estilo al formData

    try {
      const response = await axios.post('http://localhost:4000/designs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });

      console.log('Diseño agregado:', response.data);

      setSuccess('Diseño agregado exitosamente.');
      setError(null);
      setDescription('');
      setImage(null);
      setStyle(''); // Reiniciar el estado del estilo
    } catch (error) {
      console.error('Error al agregar diseño:', error);
      setError('Error al agregar diseño. Intenta nuevamente.');
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center">Agregar Diseño</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleAddDesign}>
        <Form.Group controlId="formDescription">
          <Form.Label>Descripción:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formStyle" className="mt-3">
          <Form.Label>Estilo:</Form.Label>
          <Form.Control
            as="select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            required
          >
            <option value="">Selecciona un estilo</option>
            <option value="abstracto">Abstracto</option>
            <option value="geométrico">Geométrico</option>
            <option value="floral">Floral</option>
            <option value="animal">Animal</option>
            <option value="otros">Otros</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="formImage" className="mt-3">
          <Form.Label>Imagen:</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Agregar Diseño
        </Button>
      </Form>
    </Container>
  );
};

export default AddDesign;