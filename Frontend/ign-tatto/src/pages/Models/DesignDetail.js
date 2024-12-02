// frontend/src/components/DesignDetail.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Form, Button, ListGroup } from 'react-bootstrap';
import ReactStars from 'react-rating-stars-component';

const DesignDetail = () => {
    const { id } = useParams(); // Obtiene el id desde la URL
    const [design, setDesign] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewError, setReviewError] = useState(null);
    const [reviewSuccess, setReviewSuccess] = useState(null);

    useEffect(() => {
        const fetchDesignAndReviews = async () => {
            try {
                // Obtener detalles del diseño
                const designResponse = await axios.get(`http://localhost:4000/designs/${id}`);
                setDesign(designResponse.data);
                setError(null);

                // Obtener reseñas asociadas al diseño
                const reviewsResponse = await axios.get(`http://localhost:4000/reviews/design/${id}`);
                setReviews(reviewsResponse.data);
            } catch (err) {
                setError('Error al cargar los detalles del diseño o las reseñas.');
            } finally {
                setLoading(false);
            }
        };

        fetchDesignAndReviews();
    }, [id]);

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!reviewText) {
            setReviewError('El campo de texto de la reseña es obligatorio.');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:4000/reviews/design',
                {
                    designId: id, // Asegúrate de usar snake_case si el backend lo requiere
                    rating,
                    reviewText // Cambia a 'review_text' si es necesario
                },
                { withCredentials: true } // Incluye cookies si es necesario para la autenticación
            );

            setReviewSuccess('Reseña agregada exitosamente.');
            setReviewError(null);
            setRating(0);
            setReviewText('');
            setReviews([response.data, ...reviews]); // Agrega la nueva reseña al inicio de la lista
        } catch (err) {
            console.error('Error al agregar la reseña:', err);
            setReviewError('Error al agregar la reseña. Intenta nuevamente.');
            setReviewSuccess(null);
        }
    };

    if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container className="mt-5">
            {design ? (
                <>
                    <Card>
                        <Card.Img
                            variant="top"
                            src={`http://localhost:4000/uploads/${design.image_url}`}
                            alt={design.description}
                            style={{ height: '300px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                            <Card.Title>{design.description}</Card.Title>
                            <Card.Text>
                                <strong>Estilo:</strong> {design.estilo || 'No especificado'}
                            </Card.Text>
                            <Card.Text>
                                <strong>Usuario:</strong> {design.username}
                            </Card.Text>
                            <Card.Text>
                                <strong>Creado el:</strong> {new Date(design.created_at).toLocaleString()}
                            </Card.Text>
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
                        <Button variant="primary" type="submit">
                            Agregar Reseña
                        </Button>
                    </Form>
                </>
            ) : (
                <p>Diseño no encontrado.</p>
            )}
        </Container>
    );
};

export default DesignDetail;