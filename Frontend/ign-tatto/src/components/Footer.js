// src/components/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css'; // Importa el archivo CSS


const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col>
            <p>&copy; {new Date().getFullYear()} IGN.TATTO. Todos los derechos reservados.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};


export default Footer;