// frontend/src/components/PostList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  Spinner,
  Container,
  Row,
  Col,
  Form,
  Alert,
} from 'react-bootstrap';


const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({});
  const [userLikes, setUserLikes] = useState(new Set());
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Obtener todos los posts
        const response = await axios.get('http://localhost:4000/post', {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
        setLoading(false);

        // Obtener likes para cada post
        const likesPromises = response.data.map(async (post) => {
          const likesResponse = await axios.get(
            `http://localhost:4000/${post.id}/likes-count`,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return { postId: post.id, likesCount: likesResponse.data.likesCount };
        });

        const likesData = await Promise.all(likesPromises);
        const likesObj = likesData.reduce((acc, { postId, likesCount }) => {
          acc[postId] = likesCount;
          return acc;
        }, {});
        setLikes(likesObj);

        // Obtener comentarios para cada post
        const commentsPromises = response.data.map(async (post) => {
          const commentsResponse = await axios.get(
            `http://localhost:4000/${post.id}/getcomment`,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return { postId: post.id, comments: commentsResponse.data };
        });

        const commentsData = await Promise.all(commentsPromises);
        const commentsObj = commentsData.reduce((acc, { postId, comments }) => {
          acc[postId] = comments;
          return acc;
        }, {});
        setComments(commentsObj);
      } catch (err) {
        console.error('Error al cargar los posts:', err);
        setError('Inicia sesion para la experiencia completa.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  const handleLike = async (postId) => {
    if (userLikes.has(postId)) return;

    try {
      await axios.post(
        `http://localhost:4000/${postId}/like`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLikes((prevLikes) => ({
        ...prevLikes,
        [postId]: (prevLikes[postId] ? parseInt(prevLikes[postId], 10) : 0) + 1,
      }));
      setUserLikes((prevUserLikes) => new Set(prevUserLikes).add(postId));
    } catch (err) {
      console.error('Error al dar "Me gusta":', err);
      setError('Error al dar "Me gusta".');
    }
  };

  const handleRemoveLike = async (postId) => {
    if (!userLikes.has(postId)) return;

    try {
      await axios.delete(`http://localhost:4000/${postId}/removeLike`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLikes((prevLikes) => ({
        ...prevLikes,
        [postId]: Math.max(
          (prevLikes[postId] ? parseInt(prevLikes[postId], 10) : 1) - 1,
          0
        ),
      }));
      setUserLikes((prevUserLikes) => {
        const newUserLikes = new Set(prevUserLikes);
        newUserLikes.delete(postId);
        return newUserLikes;
      });
    } catch (err) {
      console.error('Error al quitar "Me gusta":', err);
      setError('Error al quitar "Me gusta".');
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs({
      ...commentInputs,
      [postId]: value,
    });
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || text.trim() === '') {
      setError('El comentario no puede estar vacío.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:4000/${postId}/addcomment`,
        { text },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Suponiendo que el backend retorna el comentario creado
      const newComment = response.data.comment;
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newComment],
      }));

      setCommentInputs({
        ...commentInputs,
        [postId]: '',
      });

      setSuccess('Comentario añadido exitosamente.');
      setError(null);
    } catch (err) {
      console.error('Error al añadir comentario:', err);
      setError('Error al añadir comentario.');
      setSuccess(null);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Row className="g-4">
        {posts.map((post) => (
          <Col md={6} lg={4} key={post.id}>
            <Card>
              {post.image_url && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:4000/uploads/${post.image_url}`} // Asegúrate de que esta ruta es correcta
                  alt="Post"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                <Card.Text>{post.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <p className="mb-0">{likes[post.id] || 0} Me gusta</p>
                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      disabled={userLikes.has(post.id)}
                    >
                      ❤️ Me gusta
                    </Button>{' '}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveLike(post.id)}
                      disabled={!userLikes.has(post.id)}
                    >
                      💔 Quitar Me gusta
                    </Button>
                  </div>
                </div>
                <hr />
                <h6>Comentarios:</h6>
                {comments[post.id] && comments[post.id].length > 0 ? (
                  comments[post.id].map((comment) => (
                    <div key={comment.id} className="mb-2">
                      <strong>{comment.username}:</strong> {comment.text}
                      {/* Opcional: Añadir botón para eliminar comentario si pertenece al usuario */}
                    </div>
                  ))
                ) : (
                  <p>No hay comentarios aún.</p>
                )}
                <Form
                  className="mt-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddComment(post.id);
                  }}
                >
                  <Form.Group controlId={`comment-${post.id}`}>
                    <Form.Control
                      type="text"
                      placeholder="Añadir un comentario..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    />
                  </Form.Group>
                  <Button
                    variant="success"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleAddComment(post.id)}
                  >
                    Comentar
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PostList;