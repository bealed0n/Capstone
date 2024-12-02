// Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import './home.css';
import logo from '../../assets/logo.png'; // Asegúrate de que la ruta sea correcta

const Home = () => {
  const [tattooReviews, setTattooReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/home');
        setTattooReviews(response.data.tattooReviews);
        setProducts(response.data.products);
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error al obtener los datos de la home:', error);
      }
    };

    fetchHomeData();
  }, []);

  const getImageUrl = (filename) => `http://localhost:4000/uploads/${filename}`;

  return (
    <div className="home-container">
      <div className="jumbotron text-center bg-gray text-black">
        <h1 className="display-4">Bienvenido a Ign.Tattoo</h1>
        <p className="lead">Explora nuestra plataforma para encontrar los mejores diseños y servicios de tatuajes.</p>
        <p>¡Únete a nuestra comunidad y descubre lo último en tendencias de tatuajes!</p>
        <hr className="my-4" />
      </div>

      <div className="text-center mb-5">
        <img src={logo} alt="Logo de Ign.Tattoo" className="logo-image" />
      </div>
      <section className="section">
        <h2><Link to="/products-lists">Productos Destacados</Link></h2>
        <div className="cards-container">
          {products.map(product => (
            <div key={product.id} className="card">
              <img src={getImageUrl(product.image_url)} alt={product.name} className="card-image" />
              <h3 className="card-title">{product.name}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2><Link to="/reviews">Reseñas de Tatuadores</Link></h2>
        <div className="cards-container">
          {tattooReviews.map(review => (
            <div key={review.id} className="card">
              <h3>{/* Aquí puedes reemplazar con el nombre real del tatuador si está disponible */}</h3>
              <p className="card-text">{review.review_text}</p>
              <ReactStars
                count={5}
                value={review.rating}
                edit={false}
                size={24}
                activeColor="#ffd700"
              />
            </div>
          ))}
        </div>
      </section>


      <section className="section">
        <h2><Link to="/posts">Últimos Posts</Link></h2>
        <div className="cards-container">
          {posts.map(post => (
            <div key={post.id} className="card">
              <img src={getImageUrl(post.image_url)} alt={`Post ${post.id}`} className="card-image" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;