// src/pages/ReviewList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewList = ({ postId }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/reviews/${postId}`);
        setReviews(response.data);
      } catch (err) {
        setError('Error al obtener las reseñas');
        console.error(err.message);
      }
    };

    fetchReviews();
  }, [postId]);

  return (
    <div className="container mt-5">
      <h2>Reseñas</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {reviews.length === 0 ? (
        <p>No hay reseñas aún.</p>
      ) : (
        <ul className="list-group">
          {reviews.map(review => (
            <li key={review.id} className="list-group-item">
              <strong>Calificación: {review.rating}</strong>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewList;
