// src/components/UserProfile.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Card, ListGroup, Alert, Spinner, Button, Image, Form, Accordion } from 'react-bootstrap';
import { format, parseISO } from 'date-fns'; // Importa las funciones necesarias
import ReactStars from 'react-rating-stars-component'; // Importa ReactStars
import ReserveHour from '../../pages/Booking/ReserveHour'; // Importa el componente ReserveHour
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0); // Cambia a número
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Obtener el perfil del usuario específico
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true, // Asegura que se envíen las cookies si es necesario
      });
      setProfile(response.data); // Ajusta según la estructura de tu respuesta
      setIsFollowing(response.data.isFollowing); // Ajusta según la estructura de tu respuesta
    } catch (err) {
      console.error('Error al obtener el perfil:', err.response?.data || err.message);
      setError('No se pudo obtener el perfil');
    }
  };

  // Obtener las reseñas del tatuador
  const fetchTattooArtistReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/tattoo_artist_reviews/${userId}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Error al obtener las reseñas:', err.response?.data || err.message);
      setError('No se pudieron obtener las reseñas');
    }
  };

  // Llamar a las funciones al montar el componente
  useEffect(() => {
    fetchUserProfile();
    fetchTattooArtistReviews();
  }, [userId]); // Se ejecuta cada vez que cambia el userId

  // Función para manejar el formateo seguro de fechas
  const safeFormatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const parsedDate = parseISO(dateString);
      return format(parsedDate, 'dd/MM/yyyy HH:mm:ss');
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Función para seguir al usuario
  const handleFollow = async () => {
    try {
      const response = await axios.post(`http://localhost:4000/follow`, { followedId: userId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      });
      setIsFollowing(response.data.isFollowing);
    } catch (err) {
      console.error('Error al seguir al usuario:', err.response?.data || err.message);
      setError('No se pudo seguir al usuario');
    }
  };

  // Función para dejar de seguir al usuario
  const handleUnfollow = async () => {
    try {
      const response = await axios.post(`http://localhost:4000/unfollow`, { followedId: userId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      });
      setIsFollowing(response.data.isFollowing);
    } catch (err) {
      console.error('Error al dejar de seguir al usuario:', err.response?.data || err.message);
      setError('No se pudo dejar de seguir al usuario');
    }
  };

  // Función para añadir una reseña
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:4000/tattoo_artist_reviews', {
        tattooArtistId: userId,
        rating,
        reviewText
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true,
      });
      setSuccess('Reseña añadida correctamente');
      setError(null);
      setReviews([...reviews, response.data]); // Añadir la nueva reseña a la lista de reseñas
    } catch (err) {
      console.error('Error al añadir la reseña:', err.response?.data || err.message);
      setError('Error al añadir la reseña');
      setSuccess(null);
    }
  };

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando perfil...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Perfil de Usuario</h2>
          {isFollowing ? (
            <Button variant="danger" onClick={handleUnfollow}>
              Siguiendo
            </Button>
          ) : (
            <Button variant="primary" onClick={handleFollow}>
              Seguir
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          <h4>Bienvenido, {profile.username}</h4>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Rol:</strong> {profile.role}</p>
          <p><strong>Seguidores:</strong> {profile.seguidores}</p>
          <p><strong>Seguidos:</strong> {profile.seguidos}</p>

          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Reseñas</Accordion.Header>
              <Accordion.Body>
                {reviews.length > 0 ? (
                  <ListGroup>
                    {reviews.map((review) => (
                      <ListGroup.Item key={review.id}>
                        <p><strong>{review.username}</strong></p>
                        <ReactStars
                          count={5}
                          value={review.rating}
                          edit={false}
                          size={24}
                          activeColor="#ffd700"
                        />
                        <p>{review.review_text}</p>
                        <small>Creado en: {new Date(review.created_at).toLocaleString()}</small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>No hay reseñas para este tatuador.</p>
                )}

                <h5 className="mt-4">Añadir Reseña</h5>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="rating">
                    <Form.Label>Calificación</Form.Label>
                    <ReactStars
                      count={5}
                      value={rating}
                      onChange={(newRating) => setRating(newRating)}
                      size={24}
                      activeColor="#ffd700"
                    />
                  </Form.Group>
                  <Form.Group controlId="reviewText" className="mt-3">
                    <Form.Label>Reseña</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="mt-3">
                    Añadir Reseña
                  </Button>
                </Form>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Reservar una Hora</Accordion.Header>
              <Accordion.Body>
                <ReserveHour artistId={profile.id} artistName={profile.username} />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Publicaciones "Liked"</Accordion.Header>
              <Accordion.Body>
                {profile.publicaciones_liked && profile.publicaciones_liked.length > 0 ? (
                  <ListGroup>
                    {profile.publicaciones_liked.map((like) => (
                      <ListGroup.Item key={like.id} className="d-flex align-items-center">
                        <Image
                          src={`http://localhost:4000/uploads/${like.image_url}`}
                          alt="Post"
                          rounded
                          width="50"
                          height="50"
                          className="mr-3"
                        />
                        <div>
                          <p>{like.description}</p>
                          <small>Creado en: {safeFormatDate(like.created_at)}</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>No ha "liked" ninguna publicación.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Comentarios</Accordion.Header>
              <Accordion.Body>
                {profile.comentarios && profile.comentarios.length > 0 ? (
                  <ListGroup>
                    {profile.comentarios.map((comment) => (
                      <ListGroup.Item key={comment.id}>
                        <p><strong>Post:</strong> {comment.post_description}</p>
                        <p><strong>Comentario:</strong> {comment.text}</p>
                        <small>Creado en: {safeFormatDate(comment.created_at)}</small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>No ha dejado comentarios.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>

            {(profile.role === 'tattoo_artist' || profile.role === 'designer') && (
              <Accordion.Item eventKey="4">
                <Accordion.Header>Productos Creados</Accordion.Header>
                <Accordion.Body>
                  {profile.productos_creados && profile.productos_creados.length > 0 ? (
                    <ListGroup>
                      {profile.productos_creados.map((product) => (
                        <ListGroup.Item key={product.id} className="d-flex align-items-center">
                          {product.image_url && (
                            <Image
                              src={`http://localhost:4000/uploads/${product.image_url}`}
                              alt="Producto"
                              rounded
                              width="50"
                              height="50"
                              className="mr-3"
                            />
                          )}
                          <div>
                            <h6>{product.name}</h6>
                            <p>{product.description}</p>
                            <p><strong>Precio:</strong> ${product.price}</p>
                            <small>Creado en: {safeFormatDate(product.created_at)}</small>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p>No ha creado ningún producto.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            )}

            <Accordion.Item eventKey="5">
              <Accordion.Header>Publicaciones Creadas</Accordion.Header>
              <Accordion.Body>
                {profile.posts_creados && profile.posts_creados.length > 0 ? (
                  <ListGroup>
                    {profile.posts_creados.map((post) => (
                      <ListGroup.Item key={post.id} className="d-flex align-items-center">
                        {post.image_url && (
                          <Image
                            src={`http://localhost:4000/uploads/${post.image_url}`}
                            alt="Post"
                            rounded
                            width="50"
                            height="50"
                            className="mr-3"
                          />
                        )}
                        <div>
                          <p>{post.description}</p>
                          <small>Creado en: {safeFormatDate(post.created_at)}</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>No ha creado ninguna publicación.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>

            {profile.role === 'client' && (
              <Accordion.Item eventKey="6">
                <Accordion.Header>Horas Agendadas</Accordion.Header>
                <Accordion.Body>
                  {profile.horas_agendadas && profile.horas_agendadas.length > 0 ? (
                    <ListGroup>
                      {profile.horas_agendadas.map((appointment) => (
                        <ListGroup.Item key={appointment.id}>
                          <strong>Artista:</strong> {appointment.artist_username}
                          <br />
                          <strong>Fecha y Hora:</strong>{' '}
                          {appointment.appointment_datetime
                            ? safeFormatDate(appointment.appointment_datetime)
                            : 'Fecha y Hora no disponibles'}
                          <br />
                          <strong>Reservado en:</strong> {appointment.created_at
                            ? safeFormatDate(appointment.created_at)
                            : 'Fecha no disponible'}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p>No tiene horas agendadas.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            )}

            {(profile.role === 'tattoo_artist' || profile.role === 'designer') && (
              <Accordion.Item eventKey="7">
                <Accordion.Header>Reservas de Clientes</Accordion.Header>
                <Accordion.Body>
                  {profile.reservas_clientes && profile.reservas_clientes.length > 0 ? (
                    <ListGroup>
                      {profile.reservas_clientes.map((reservation) => (
                        <ListGroup.Item key={reservation.id}>
                          <strong>Cliente:</strong> {reservation.client_username}
                          <br />
                          <strong>Fecha y Hora:</strong>{' '}
                          {reservation.appointment_datetime
                            ? safeFormatDate(reservation.appointment_datetime)
                            : 'Fecha y Hora no disponibles'}
                          <br />
                          <strong>Reservado en:</strong> {reservation.created_at
                            ? safeFormatDate(reservation.created_at)
                            : 'Fecha no disponible'}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p>No tiene reservas de clientes.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            )}
          </Accordion>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfile;