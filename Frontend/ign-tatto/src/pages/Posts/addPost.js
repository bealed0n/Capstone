import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container } from 'react-bootstrap';

const AddPost = () => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAddPost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('imageUrl', imageUrl); // Asegúrate de que el nombre coincida con el backend

      const response = await axios.post('http://localhost:4000/addPost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      console.log('Publicación agregada:', response.data);

      setSuccess('Publicación agregada exitosamente.');
      setError(null);
      setDescription('');
      setImage(null);
    } catch (error) {
      console.error('Error al agregar publicación:', error);
      setError('Error al agregar publicación. Intenta nuevamente.');
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4">Agregar Publicación</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleAddPost}>
        <Form.Group controlId="description" className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingresa la descripción de la publicación"
            rows={5}
            required
          />
        </Form.Group>

        <Form.Group controlId="image" className="mb-3">
          <Form.Label>Imagen</Form.Label>
          <Form.Control
            type="file"
            name="image"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Agregar Publicación
        </Button>
      </Form>
    </Container>
  );
};

export default AddPost;