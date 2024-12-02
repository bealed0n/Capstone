// src/components/Profile.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Container, Card, ListGroup, Alert, Spinner, Button, Image, Form, Accordion } from 'react-bootstrap';
import { format, parseISO } from 'date-fns'; // Importa las funciones necesarias
import ReactStars from 'react-rating-stars-component'; // Importa ReactStars

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Obtener el token JWT almacenado
  const token = Cookies.get('token');

  // Obtener el perfil del usuario
  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:4000/profile', { // Asegúrate de que la ruta incluya /api si es necesario
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // Asegura que se envíen las cookies si es necesario
      });
      setProfile(response.data.profile); // Ajusta según la estructura de tu respuesta
      setUsername(response.data.profile.username);
      setEmail(response.data.profile.email);
    } catch (err) {
      console.error('Error al obtener el perfil:', err.response?.data || err.message);
      setError('No se pudo obtener el perfil');
    }
  };

  // Obtener las reseñas del tatuador
  const fetchTattooArtistReviews = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:4000/tattoo_artist_reviews/${userId}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Error al obtener las reseñas:', err.response?.data || err.message);
      setError('No se pudieron obtener las reseñas');
    }
  };

  // Llamar a la función al montar el componente
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al cargar el componente

  useEffect(() => {
    if (profile && profile.role === 'tattoo_artist') {
      fetchTattooArtistReviews(profile.id);
    }
  }, [profile]);

  const handleLogout = () => {
    // Eliminar la cookie
    Cookies.remove('token');
    // Redirigir al login
    navigate('/login');
    window.location.reload(); // Recarga la página
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:4000/users/${profile.id}`, { // Asegúrate de que la ruta incluya /api si es necesario
        username,
        email,
        password
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true, 
      });

      setSuccess('Datos actualizados correctamente');
      setError(null);
      // Actualizar el perfil con la respuesta del servidor si es necesario
      setProfile(response.data.profile);
    } catch (err) {
      setError('Error al actualizar los datos');
      setSuccess(null);
      console.error('Error al actualizar el perfil:', err.response?.data || err.message);
    }
  };

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

  if (error && !profile) {
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
          <Button variant="danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Card.Header>
        <Card.Body>
          <Accordion defaultActiveKey="0">
            {/* Información Básica del Usuario */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>Información Básica</Accordion.Header>
              <Accordion.Body>
                <h4>Bienvenido, {profile.username}</h4>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Rol:</strong> {profile.role}</p>
                <p><strong>Seguidores:</strong> {profile.seguidores}</p>
                <p><strong>Seguidos:</strong> {profile.seguidos}</p>
              </Accordion.Body>
            </Accordion.Item>

            {/* Formulario para actualizar datos */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>Actualizar Datos</Accordion.Header>
              <Accordion.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="username">
                    <Form.Label>Nombre de Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="email" className="mt-3">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="password" className="mt-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Deja el campo en blanco si no deseas cambiar la contraseña.
                    </Form.Text>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="mt-3">
                    Actualizar
                  </Button>
                </Form>
              </Accordion.Body>
            </Accordion.Item>

            {/* Publicaciones "Liked" */}
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
                          className="me-3"
                        />
                        <div>
                          <p>{like.description}</p>
                          <small>Creado en: {safeFormatDate(like.created_at)}</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>No has "liked" ninguna publicación.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>

            {/* Comentarios */}
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
                  <p>No has dejado comentarios.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>

            {/* Productos Creados (para artistas y diseñadores) */}
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
                              className="me-3"
                            />
                          )}
                          <div>
                            <h6>{product.name}</h6>
                            <p>{product.description}</p>
                            <p><strong>Precio:</strong> ${product.price}</p>
                            <p><strong>Stock:</strong> {product.stock}</p>
                            <small>Creado en: {safeFormatDate(product.created_at)}</small>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p>No has creado ningún producto.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            )}

            {/* Publicaciones Creadas */}
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
                            className="me-3"
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
                  <p>No has creado ninguna publicación.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>

            {/* Horas Agendadas (para clientes) */}
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
                    <p>No tienes horas agendadas.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            )}

            {/* Reservas de Clientes (para artistas y diseñadores) */}
            {(profile.role === 'tattoo_artist' || profile.role === 'designer') && (
              <Accordion.Item eventKey="7">
                <Accordion.Header>Reservas de Clientes</Accordion.Header>
                <Accordion.Body>
                  {profile.horas_agendadas_con_clientes && profile.horas_agendadas_con_clientes.length > 0 ? (
                    <ListGroup>
                      {profile.horas_agendadas_con_clientes.map((reservation) => (
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
                    <p>No tienes reservas de clientes.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            )}

            {/* Reseñas de Tatuador */}
            {profile.role === 'tattoo_artist' && (
              <Accordion.Item eventKey="8">
                <Accordion.Header>Reseñas</Accordion.Header>
                <Accordion.Body>
                  {reviews.length > 0 ? (
                    <ListGroup>
                      {reviews.map((review) => (
                        <ListGroup.Item key={review.id}>
                          <p><strong>{review.reviewer_username}</strong></p>
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
                </Accordion.Body>
              </Accordion.Item>
            )}
          </Accordion>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;