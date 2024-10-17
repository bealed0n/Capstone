// src/pages/ProductReviews.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/reviews/${productId}`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error al obtener las reseñas:', error);
      }
    };
    fetchReviews();
  }, [productId]);

  return (
    <div className="product-reviews">
      <h3>Reseñas del Producto</h3>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} className="review">
            <h5>{review.username}</h5>
            <p>{review.review_text}</p>
            <p>Calificación: {review.rating} estrellas</p>
            <small>{new Date(review.created_at).toLocaleDateString()}</small>
          </div>
        ))
      ) : (
        <p>No hay reseñas para este producto.</p>
      )}
    </div>
  );
};

export default ProductReviews;
