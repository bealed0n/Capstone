// src/components/AddPost.js

import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import logo from '../../assets/logo.png'; // Asegúrate de que la ruta sea correcta
import './addPost.css'; // Importa el nuevo archivo CSS

const AddPost = () => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

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
      setImageUrl(null);
    } catch (error) {
      console.error('Error al agregar publicación:', error);
      setError('Error al agregar publicación. Intenta nuevamente.');
      setSuccess(null);
    }
  };

  return (
    <div className="add-post-container">
      <div className="add-post-image-container">
        <img src={logo} alt="Agregar Publicación" className="add-post-image" />
      </div>
      <div className="add-post-form-container">
        <form className="add-post-form" onSubmit={handleAddPost}>
          <h2>Agregar Publicación</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ingresa la descripción de la publicación"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Imagen:</label>
            <input
              type="file"
              id="imageUrl"
              onChange={(e) => setImageUrl(e.target.files[0])}
              required
            />
          </div>

          <button type="submit" className="btn-submit">Agregar Publicación</button>
        </form>
      </div>
    </div>
  );
};

export default AddPost;