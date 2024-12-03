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
import './postList.css'; // Archivo CSS personalizado

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
        const response = await axios.get('http://localhost:4000/post', {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
        setLoading(false);

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

      const newComment = response.data.comment;
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newComment],
      }));

      setCommentInputs({
        ...commentInputs,
        [postId]: '',
      });

      setError(null);

      // Eliminar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
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
    <Container fluid className="post-list-container mt-5">
      {error && <Alert variant="danger" className="small-alert">{error}</Alert>}
      {success && <Alert variant="success" className="small-alert">{success}</Alert>}
      <Row className="justify-content-center">
        {posts.map((post) => (
          <Col md={8} lg={6} key={post.id} className="mb-4">
            <Card className="post-card">
              {post.image_url && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:4000/uploads/${post.image_url}`} // Asegúrate de que esta ruta es correcta
                  alt="Post"
                  style={{ height: '400px', objectFit: 'cover' }}
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