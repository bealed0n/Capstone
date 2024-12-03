import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();

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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    </div>
  );
  
  if (error) return <Alert variant="danger" className="m-3">{error}</Alert>;

  return (
    <div className="product-list-container">
      <div className="search-column">
      <h1 className="product-list-title">Catálogo de Productos</h1>
        <Form onSubmit={handleSearch} className="search-form">
          <Form.Group controlId="query">
            <Form.Label>Buscar</Form.Label>
            <Form.Control
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos"
            />
          </Form.Group>
          <Form.Group controlId="category">
            <Form.Label>Categoría</Form.Label>
            <Form.Control
              as="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="minPrice">
            <Form.Label>Precio Mínimo</Form.Label>
            <Form.Control
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
            />
          </Form.Group>
          <Form.Group controlId="maxPrice">
            <Form.Label>Precio Máximo</Form.Label>
            <Form.Control
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="0"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="">
            BUSCAR
          </Button>
        </Form>
      </div>
      <div className="products-column">
        <Row xs={1} md={2} lg={3} className="g-4">
          {products.map(product => (
            <Col key={product.id}>
              <Card className="producto-card h-100">
                <Card.Img
                  variant="top"
                  src={`http://localhost:4000/uploads/${product.image_url}`}
                  alt={product.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                  loading="lazy"
                />
                <Card.Body className="CARDPRODUCT">
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>{product.description}</Card.Text>
                  <Card.Text className="card-price mt-auto"><strong>Precio:</strong> ${product.price}</Card.Text>
                  <Card.Text className="card-category"><strong>Categoría:</strong> {product.category}</Card.Text>
                  <Button 
                    variant="primary" 
                    onClick={() => handleViewDetails(product.id)}
                    className="mt-auto btn-view-details"
                  >
                    Ver detalles
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ProductList;

