// src/pages/TattooArtistRegister.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TattooArtistRegister = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/tattoo_artist/register', { username, email, password });
      alert('Tatuador registrado con éxito');
      navigate('/login');
    } catch (error) {
      console.error('Error en el registro:', error.response.data);
      alert('Error al registrarse. Intenta de nuevo.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Registro de Tatuador</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-success btn-block">Registrarse</button>
      </form>
    </div>
  );
};

export default TattooArtistRegister;
