// src/pages/ModelList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './ModelList.css';
import ModelPreview from './ModelPreview'; // Ajusta la ruta según tu estructura de carpetas

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

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );

  if (error) return <Alert variant="danger" className="m-3">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h1 className=""style={{textAlign:'center'}}>Lista de Modelos 3D</h1>
      <Row>
        {models.map(model => (
          <Col key={model.id} xs={12} md={6} lg={4} className="mb-4">
            <Card className="model-card h-100">
              <div className="model-preview-container">
                <ModelPreview modelUrl={`http://localhost:4000/${model.model_url}`} />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title>{model.name}</Card.Title>
                <Card.Text>{model.description}</Card.Text>
                <Button as={Link} to={`/models/${model.id}`} variant="primary" className="mt-auto">
                  Ver Detalles
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ModelList;