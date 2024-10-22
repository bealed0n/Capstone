import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container } from 'react-bootstrap';

const UploadPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('image', image);

      const response = await axios.post('http://localhost:5000/posts/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Publicación subida exitosamente.');
      setError(null);
      setTitle('');
      setContent('');
      setImage(null);
    } catch (error) {
      console.error('Error al subir la publicación:', error);
      if (error.response && error.response.status === 401) {
        setError('No autorizado. Por favor, inicia sesión nuevamente.');
      } else {
        setError('Error al subir el post');
      }
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center">Subir Publicación</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleUpload}>
        <Form.Group controlId="formTitle">
          <Form.Label>Título:</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formContent" className="mt-3">
          <Form.Label>Contenido:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
          Subir
        </Button>
      </Form>
    </Container>
  );
};

export default UploadPost;