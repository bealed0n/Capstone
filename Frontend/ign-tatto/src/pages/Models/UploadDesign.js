import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import designImage from '../../assets/a.jpg'; // Reemplaza con la ruta correcta a tu imagen
import './UploadDesign.css'; // Importa el nuevo archivo CSS

const UploadDesign = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [style, setStyle] = useState(''); // Estado para manejar el estilo
  const [category, setCategory] = useState(''); // Estado para manejar la categoría
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
    formData.append('category', category); // Añadir la categoría al formData

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
      setCategory(''); // Reiniciar el estado de la categoría
    } catch (error) {
      console.error('Error al agregar diseño:', error);
      setError('Error al agregar diseño. Intenta nuevamente.');
      setSuccess(null);
    }
  };

  return (
    <div className="upload-design-container">
      <div className="upload-design-image-container">
        <img src={designImage} alt="Agregar Diseño" className="upload-design-image" />
      </div>
      <div className="upload-design-form-container">
        <form className="upload-design-form" onSubmit={handleAddDesign}>
          <h2>Agregar Diseño</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ingresa la descripción del diseño"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="style">Estilo:</label>
            <select
              id="style"
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
            </select>
          </div>


          <div className="form-group">
            <label htmlFor="image">Imagen:</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>

          <button type="submit" className="btn-submit">Agregar Diseño</button>
        </form>
      </div>
    </div>
  );
};

export default UploadDesign;