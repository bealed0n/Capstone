// src/pages/UploadPost.js
import React, { useState } from 'react';
import axios from 'axios';

const UploadPost = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
      });

      setSuccess('Publicación subida con éxito');
      setImage(null);
      setDescription('');
    } catch (err) {
      setError('Error al subir la publicación');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Subir Publicación</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Imagen</label>
          <input type="file" className="form-control" onChange={handleImageChange} required />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Subir Publicación</button>
      </form>
    </div>
  );
};

export default UploadPost;
