import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Spinner, Container, Row, Col } from 'react-bootstrap';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({});
  const [userLikes, setUserLikes] = useState(new Set());

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
      } catch (err) {
        console.error('Error al cargar los posts:', err);
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
        [postId]: Math.max((prevLikes[postId] ? parseInt(prevLikes[postId], 10) : 1) - 1, 0),
      }));
      setUserLikes((prevUserLikes) => {
        const newUserLikes = new Set(prevUserLikes);
        newUserLikes.delete(postId);
        return newUserLikes;
      });
    } catch (err) {
      console.error('Error al quitar "Me gusta":', err);
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
      <Row className="g-4">
        {posts.map((post) => (
          <Col md={6} lg={4} key={post.id}>
            <Card>
              {post.image_url && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:4000/uploads/${post.image_url}`}
                  alt="Post"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <Card.Title>{post.description}</Card.Title>
                <div className="d-flex justify-content-between align-items-center">
                  <p className="mb-0">{likes[post.id]} Me gusta</p>
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
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PostList;
