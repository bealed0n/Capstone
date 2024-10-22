import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">IGN Tatto</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/client/register">
              <Nav.Link>Registro Cliente</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/tattoo_artist/register">
              <Nav.Link>Registro Tatuador</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/designer/register">
              <Nav.Link>Registro Diseñador</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/login">
              <Nav.Link>Login</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/products-lists">
              <Nav.Link>Productos</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/add-product">
              <Nav.Link>Agregar Producto</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/model3d">
              <Nav.Link>Modelo 3D</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/profile">
              <Nav.Link>Perfil</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/upload">
              <Nav.Link>Subir Publicación</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/posts-list">
              <Nav.Link>Publicaciones</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/create-slot">
              <Nav.Link>Crear Espacio</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/reserve-slot">
              <Nav.Link>Reservar Espacio</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;