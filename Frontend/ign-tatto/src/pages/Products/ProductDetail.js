// src/pages/Products/ProductDetail.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Form, Button } from 'react-bootstrap';
import ReactStars from 'react-rating-stars-component';
import { CartContext } from '../../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams(); // Obtiene el id desde la URL
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/productos/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles del producto.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/reviews/${id}`);
        setReviews(response.data);
      } catch (err) {
        console.error('Error al cargar las reseñas:', err);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText) {
      setReviewError('El campo de texto de la reseña es obligatorio.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:4000/reviews', {
        productId: id,
        rating,
        reviewText
      }, { withCredentials: true });

      setReviewSuccess('Reseña agregada exitosamente.');
      setReviewError(null);
      setRating(0);
      setReviewText('');
      setReviews([...reviews, response.data]);
    } catch (err) {
      console.error('Error al agregar la reseña:', err);
      setReviewError('Error al agregar la reseña. Intenta nuevamente.');
      setReviewSuccess(null);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      {product ? (
        <>
          <Card>
            <Card.Img
              variant="top"
              src={`http://localhost:4000/uploads/${product.image_url}`}
              alt={product.name}
              style={{ height: '300px', objectFit: 'cover' }}
            />
            <Card.Body>
              <Card.Title>{product.name}</Card.Title>
              <Card.Text>{product.description}</Card.Text>
              <Card.Text><strong>Precio:</strong> ${product.price}</Card.Text>
              <Button variant="primary" onClick={handleAddToCart}>Añadir al Carrito</Button>
            </Card.Body>
          </Card>

          <h3 className="mt-4">Reseñas</h3>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <Card key={review.id} className="mb-3">
                <Card.Body>
                  <Card.Title>{review.username}</Card.Title>
                  <div>
                    <strong>Rating:</strong> 
                    <ReactStars
                      count={5}
                      value={review.rating}
                      edit={false}
                      size={24}
                      activeColor="#ffd700"
                    />
                  </div>
                  <Card.Text>{review.review_text}</Card.Text>
                  <Card.Text><small>{new Date(review.created_at).toLocaleString()}</small></Card.Text>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No hay reseñas para este producto.</p>
          )}

          <h3 className="mt-4">Agregar Reseña</h3>
          {reviewError && <Alert variant="danger">{reviewError}</Alert>}
          {reviewSuccess && <Alert variant="success">{reviewSuccess}</Alert>}
          <Form onSubmit={handleAddReview}>
            <Form.Group controlId="rating" className="mb-3">
              <Form.Label>Rating</Form.Label>
              <ReactStars
                count={5}
                value={rating}
                onChange={(newRating) => setRating(newRating)}
                size={24}
                activeColor="#ffd700"
              />
            </Form.Group>
            <Form.Group controlId="reviewText" className="mb-3">
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">Agregar Reseña</Button>
          </Form>
        </>
      ) : (
        <p>Producto no encontrado.</p>
      )}
    </Container>
  );
};

export default ProductDetail;