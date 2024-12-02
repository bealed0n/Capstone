import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DesignGallery = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState('');
  const navigate = useNavigate();

  // Definir las categorías permitidas
  const styles = [
    'abstracto',
    'geométrico',
    'floral',
    'animal',
    'otros'
  ];

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/designs');
      setDesigns(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los diseños.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/search/designs', {
        params: {
          query,
          estilo: style
        }
      });
      setDesigns(response.data);
      setError(null);
    } catch (err) {
      setError('Error al buscar los diseños.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (designId) => {
    navigate(`/designs/${designId}`);
  };

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Galería de Diseños</h1>
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={6}>
            <Form.Group controlId="query">
              <Form.Label>Buscar</Form.Label>
              <Form.Control
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar diseños"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="style">
              <Form.Label>Estilo</Form.Label>
              <Form.Control
                as="select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="">Todos los estilos</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button variant="primary" type="submit">
              Buscar
            </Button>
          </Col>
        </Row>
      </Form>
      <Row>
        {designs.map(design => (
          <Col key={design.id} xs={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Img
                variant="top"
                src={`http://localhost:4000/uploads/${design.image_url}`}
                style={{ height: '200px', objectFit: 'cover' }}
                loading="lazy"
              />
              <Card.Body>
                <Card.Title>{design.name}</Card.Title>
                <Card.Text>{design.description}</Card.Text>
                <Card.Text><strong>Estilo:</strong> {design.estilo}</Card.Text>
                <Button variant="primary" onClick={() => handleViewDetails(design.id)}>
                  Ver detalles
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DesignGallery;