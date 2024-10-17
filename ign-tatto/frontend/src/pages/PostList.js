// src/pages/PostList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/posts'); // Usa la ruta relativa gracias al proxy
        if (Array.isArray(response.data)) {
          setPosts(response.data);
        } else {
          console.error('La respuesta no es un array:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener publicaciones:', error);
        setError('Error al cargar las publicaciones');
      }
    };
    fetchPosts();
  }, []);

  

  return (
    <div className="container mt-5">
      <h2 className="text-center">Publicaciones de Tatuadores</h2>
      {error && <div className="alert alert-danger">{error}</div>} {/* Mostrar mensaje de error si hay */}
      <div className="row">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={`http://localhost:5000${post.image_url}`} // Asegúrate de que esta URL esté correcta
                  className="card-img-top"
                  alt={post.description}
                />
                <div className="card-body">
                  <h5 className="card-title">{post.username}</h5>
                  <p className="card-text">{post.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No hay publicaciones disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default PostList;