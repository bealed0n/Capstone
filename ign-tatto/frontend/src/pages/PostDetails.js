// src/pages/PostDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const response = await axios.get(`/posts/${id}`);
      setPost(response.data);
    };
    fetchPost();
  }, [id]);

  if (!post) {
    return <div className="container mt-5">Cargando...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={`http://localhost:5000${post.image_url}`} // Asegúrate de que esta URL esté correcta
            className="img-fluid"
            alt={post.description}
          />
        </div>
        <div className="col-md-6">
          <h3>{post.username}</h3>
          <p>{post.description}</p>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;