// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  // Cargar token, rol y nombre de usuario del localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedUsername = localStorage.getItem('username');
    if (savedToken) {
      setToken(savedToken);
      setRole(savedRole);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken(null);
    setRole(null);
    setUsername(null);
    navigate('/login'); // Redirigir al login después de cerrar sesión
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Ign Tattoo</Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {role === 'tattoo_artist' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/upload">Subir Publicación</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/add-product">Agregar Producto</Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/products">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/preview">Tattoo Preview</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/booking">Booking</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/model3d">Modelo 3D</Link>
            </li>
            {role === 'client' && (
              <li className="nav-item">
                <Link className="nav-link" to="/reviews">Reseñas</Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ml-auto">
            {token ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text">
                    Bienvenido, {username} ({role})
                  </span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Perfil</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={handleLogout}>Cerrar Sesión</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Iniciar Sesión</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="registerDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Registrarse
                  </a>
                  <div className="dropdown-menu" aria-labelledby="registerDropdown">
                    <Link className="dropdown-item" to="/client/register">Cliente</Link>
                    <Link className="dropdown-item" to="/tattoo_artist/register">Tatuador</Link>
                    <Link className="dropdown-item" to="/designer/register">Diseñador</Link>
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
