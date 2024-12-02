import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ModelList = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://localhost:4000/models');
        setModels(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los modelos 3D.');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Lista de Modelos 3D</h1>
      <Row>
        {models.map(model => (
          <Col key={model.id} xs={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{model.name}</Card.Title>
                <Card.Text>{model.description}</Card.Text>
                <Link to={`/models/${model.id}`} className="btn btn-primary">
                  Ver Modelo
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ModelList;