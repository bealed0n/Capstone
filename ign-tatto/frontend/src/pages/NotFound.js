import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container mt-5 text-center">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>Lo sentimos, la página que estás buscando no existe :c.</p>
      <Link to="/" className="btn btn-primary">Volver al Inicio</Link>
    </div>
  );
};

export default NotFound;