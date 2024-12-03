// src/pages/Postulaciones/PostulacionForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';
import postulacionImage from '../../assets/Postulacion.png'; // Ajusta la ruta si es necesario
import './postulacion.css'; // Archivo CSS personalizado para postulación

const PostulacionForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tattoo_artist');
  const [requisitos, setRequisitos] = useState([]); // Para almacenar las imágenes
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Manejar la selección de archivos (imágenes)
  const handleFileChange = (e) => {
    const files = e.target.files;
    setRequisitos([...files]);
  };

  // Validar y enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos
    if (!username || !email || !password || requisitos.length === 0) {
      setError('Todos los campos son obligatorios');
      return;
    }

    // Crear FormData para enviar los datos y archivos
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    
    // Añadir los archivos bajo el nombre 'requisitos'
    requisitos.forEach((file) => {
      formData.append('requisitos', file); // Usar 'requisitos' como el nombre del campo
    });

    try {
      const response = await axios.post('http://localhost:4000/add-postulaciones', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Necesario para enviar archivos
        },
      });

      if (response.status === 201) {
        setSuccessMessage('Postulación enviada exitosamente');
        // Limpiar el formulario
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('tattoo_artist');
        setRequisitos([]);
        setError('');
      }
    } catch (err) {
      console.error('Error al enviar la postulación:', err);
      setError('Hubo un problema al enviar la postulación. Intenta de nuevo.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="postulacion-container">
      <div className="postulacion-image-container">
        <img src={postulacionImage} alt="Postulación" className="postulacion-image" />
      </div>
      <div className="postulacion-form-container">
        <form className="postulacion-form" onSubmit={handleSubmit}>
          <h2>Formulario de Postulación</h2>

          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <Form.Group controlId="formUsername" className="form-group">
            <Form.Label className="form-label">Nombre de usuario</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="form-group">
            <Form.Label className="form-label">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="form-group">
            <Form.Label className="form-label">Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formRole" className="form-group">
            <Form.Label className="form-label">Rol</Form.Label>
            <Form.Control
              as="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="tattoo_artist">Tatuador</option>
              <option value="designer">Diseñador</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formRequisitos" className="form-group">
            <Form.Label className="form-label">Requisitos (OBLIGATORIO CV, Certificado Asepsia)</Form.Label>
            <Form.Control
              type="file"
              multiple
              name="requisitos"  // Este debe coincidir con el nombre en el backend
              onChange={handleFileChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="btn-submit">
            Postular
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostulacionForm;