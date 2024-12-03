import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import loginImage from '../../assets/login.jpg'; // Asegúrate de que la ruta es correcta
import './login.css'; // Archivo CSS personalizado para login


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');


    // Validación de campos
    if (!email || !password) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }


    try {
      // Asegúrate de agregar `withCredentials: true` para enviar cookies
      const response = await axios.post('http://localhost:4000/login', { email, password }, {
        withCredentials: true, // Esto envía la cookie del token
      });
      console.log('Login exitoso:', response.data);
      setSuccessMessage('Inicio de sesión exitoso');
      setError('');
      navigate('/'); // Redirigir al home después de iniciar sesión
      window.location.reload(); // Recarga la página
    } catch (error) {
      console.error('Error en el login:', error.response?.data);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      <div className="login-image-container">
        <img src={loginImage} alt="Login" className="login-image" />
      </div>
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar Sesión</h2>


          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}


          <Form.Group controlId="formEmail" className="form-group">
            <Form.Label className="form-label">Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>


          <Form.Group controlId="formPassword" className="form-group">
            <Form.Label className="form-label">Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>


          <Button variant="primary" type="submit" className="btn-submit" disabled={loading}>
            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
};


export default Login;
