import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import modelImage from '../../assets/model.jpg'; // Reemplaza con la ruta correcta a tu imagen
import './AddModel.css'; // Importa el nuevo archivo CSS

const AddModel = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
      setSuccess('Modelo 3D agregado exitosamente.');
      setError(null);
      setName('');
      setDescription('');
      setModel(null);
      navigate('/models');
    } catch (err) {
      console.error('Error al agregar modelo 3D:', err.response?.data || err.message);
      setError('No se pudo agregar el modelo 3D');
      setSuccess(null);
    }
  };

  return (
    <div className="add-model-container">
      <div className="add-model-image-container">
        <img src={modelImage} alt="Agregar Modelo 3D" className="add-model-image" />
      </div>
      <div className="add-model-form-container">
        <form className="add-model-form" onSubmit={handleSubmit}>
          <h2>Agregar Modelo 3D</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ingresa el nombre del modelo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ingresa la descripción del modelo"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="model">Archivo del Modelo 3D:</label>
            <input
              type="file"
              id="model"
              onChange={(e) => setModel(e.target.files[0])}
              required
            />
          </div>

          <button type="submit" className="btn-submit">Agregar Modelo 3D</button>
        </form>
      </div>
    </div>
  );
};

export default AddModel;