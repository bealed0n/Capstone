// src/pages/Home.js
import React from 'react';

const Home = () => {
  return (
    <div className="container mt-5">
      <div className="jumbotron text-center">
        <h1 className="display-4">Bienvenido a Ign.Tattoo</h1>
        <p className="lead">Explora nuestra plataforma para encontrar los mejores diseños y servicios de tatuajes.</p>
        <hr className="my-4" />
        <p>¡Únete a nuestra comunidad y descubre lo último en tendencias de tatuajes!</p>
        <a className="btn btn-primary btn-lg" href="/register" role="button">Registrarse</a>
      </div>

      <div className="row">
        {/* Noticias */}
        <div className="col-md-6 mb-4">
          <h3>Últimas Noticias</h3>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Nueva Colección de Diseños</h5>
              <p className="card-text">Descubre nuestra nueva colección de diseños únicos y exclusivos para este mes.</p>
              <a href="/products" className="btn btn-primary">Ver más</a>
            </div>
          </div>
        </div>

        {/* Comentarios */}
        <div className="col-md-6 mb-4">
          <h3>Testimonios de Clientes</h3>
          <div className="card">
            <div className="card-body">
              <blockquote className="blockquote mb-0">
                <p>"Tuve una experiencia increíble en Ign.Tattoo. ¡El mejor lugar para hacerme mi primer tatuaje!"</p>
                <footer className="blockquote-footer">Juan Pérez en <cite title="Source Title">Opiniones</cite></footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Imágenes de Tatuajes */}
      <h3 className="mt-5">Galería de Tatuajes</h3>
      <div className="row">
        <div className="col-md-4 mb-4">
          <img src="https://via.placeholder.com/300x200" className="img-fluid" alt="Tatuaje 1" />
        </div>
        <div className="col-md-4 mb-4">
          <img src="https://via.placeholder.com/300x200" className="img-fluid" alt="Tatuaje 2" />
        </div>
        <div className="col-md-4 mb-4">
          <img src="https://via.placeholder.com/300x200" className="img-fluid" alt="Tatuaje 3" />
        </div>
      </div>
    </div>
  );
};

export default Home;
