import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import registerImage from '../../assets/usuario.png'; // Asegúrate de que la ruta sea correcta
import './register.css'; // Archivo CSS personalizado

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/client/register', { username, email, password });
      alert('Usuario registrado con éxito');
      navigate('/login'); // Redirigir a la página de login después de registrarse
    } catch (error) {
      console.error('Error en el registro:', error.response.data);
      alert('Error al registrarse. Intenta de nuevo.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        {/* Imagen de registro */}
      {/* Imagen de registro */}
      <div className="register-image-container">
        <img src={registerImage} alt="Registro" className="register-image" />
      </div>
        {/* Formulario */}
        <div className="register-form-container">
          <h2 className="register-title">Regístrate</h2>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="username">Nombre</label>
              <input
                type="text"
                id="username"
                className="form-control"
                placeholder="Nombre"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
