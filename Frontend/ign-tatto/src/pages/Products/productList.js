// src/pages/Products/ProductList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/productos');
        console.log(response.data);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los productos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleViewDetails = (productId) => {
    navigate(`/productos/${productId}`);
  };

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Lista de Productos</h1>
      <Row>
        {products.map(product => (
          <Col key={product._id} xs={12} md={6} lg={4} className="mb-4">
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
