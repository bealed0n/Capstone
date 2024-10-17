import React, { useState } from 'react';
import axios from 'axios';

const AddReview = ({ productId }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/reviews/add', {
        product_id: productId,
        review_text: reviewText,
        rating: rating,
      });

      if (response.data) {
        alert('Reseña enviada con éxito');
        setReviewText('');
        setRating(1);
      }
    } catch (err) {
      setError('Error al enviar la reseña.');
      console.error(err);
    }
  };

  return (
    <div className="add-review">
      <h3>Deja una Reseña</h3>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tu Reseña</label>
          <textarea
            className="form-control"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Calificación</label>
          <select
            className="form-control"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} estrellas
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Enviar Reseña</button>
      </form>
    </div>
  );
};

export default AddReview;