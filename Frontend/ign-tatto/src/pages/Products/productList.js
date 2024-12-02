import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();

  // Definir las categorías permitidas
  const categories = [
    'cartuchos',
    'maquinas',
    'cuidado',
    'insumos',
    'tintas',
    'otros'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/productos');
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/searchProducts', {
        params: {
          query,
          category,
          minPrice,
          maxPrice
        }
      });
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Error al buscar los productos.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/productos/${productId}`);
  };

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Lista de Productos</h1>
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Group controlId="query">
              <Form.Label>Buscar</Form.Label>
              <Form.Control
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="category">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                as="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="minPrice">
              <Form.Label>Precio Mínimo</Form.Label>
              <Form.Control
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="maxPrice">
              <Form.Label>Precio Máximo</Form.Label>
              <Form.Control
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="0"
              />
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
        {products.map(product => (
          <Col key={product.id} xs={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Img
                variant="top"
                src={`http://localhost:4000/uploads/${product.image_url}`}
                style={{ height: '200px', objectFit: 'cover' }}
                loading="lazy"
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text><strong>Precio:</strong> ${product.price}</Card.Text>
                <Card.Text><strong>categoria:</strong> {product.category}</Card.Text>
                <Button variant="primary" onClick={() => handleViewDetails(product.id)}>
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

export default ProductList;