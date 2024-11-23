// src/pages/Home.js
import React from 'react';
import './home.css';

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
            <img src="https://via.placeholder.com/400x200" className="card-img-top" alt="Nueva Colección de Diseños" />
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

      <div className="row">
        {/* Galería de Productos */}
        <div className="col-12">
          <h3>Galería de Productos</h3>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <img src="https://via.placeholder.com/400x400" className="card-img-top" alt="Producto 1" />
            <div className="card-body">
              <h5 className="card-title">Producto 1</h5>
              <p className="card-text">Descripción breve del producto 1.</p>
              <a href="/productos/14" className="btn btn-primary">Ver más</a>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <img src="https://via.placeholder.com/400x400" className="card-img-top" alt="Producto 2" />
            <div className="card-body">
              <h5 className="card-title">Producto 2</h5>
              <p className="card-text">Descripción breve del producto 2.</p>
              <a href="/productos/2" className="btn btn-primary">Ver más</a>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <img src="https://via.placeholder.com/400x400" className="card-img-top" alt="Producto 3" />
            <div className="card-body">
              <h5 className="card-title">Producto 3</h5>
              <p className="card-text">Descripción breve del producto 3.</p>
              <a href="/productos/3" className="btn btn-primary">Ver más</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;