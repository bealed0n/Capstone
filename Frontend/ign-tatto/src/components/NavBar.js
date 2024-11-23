import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';// src/index.js
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">IGN.TATTO</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <LinkContainer to="/">
              <Nav.Link>Inicio</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/client/register">
              <Nav.Link>Registro</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/login">
              <Nav.Link>Login</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/profile">
              <Nav.Link>Perfil</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/model3d">
              <Nav.Link>Modelo 3D</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/products-lists">
              <Nav.Link>Productos</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/add-product">
              <Nav.Link>Agregar Producto</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/cart">
              <Nav.Link>Carrito</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/add-post">
              <Nav.Link>Subir Publicación</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/posts-list">
              <Nav.Link>Publicaciones</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/postulaciones-list">
              <Nav.Link>Postulaciones</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/postulacion-form">
              <Nav.Link>Formulario de Postulación</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;