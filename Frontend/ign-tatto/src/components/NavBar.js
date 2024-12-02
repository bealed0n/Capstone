import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

const NavigationBar = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = cookies.get('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
        console.log('Decoded Token:', decodedToken); // Verificar el token decodificado
        console.log('User Role:', decodedToken.role); // Verificar el rol del usuario
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

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

            <LinkContainer to="/products-lists">
              <Nav.Link>Productos</Nav.Link>
            </LinkContainer>
            
            {userRole === 'tattoo_artist' && (
              <>
                <LinkContainer to="/add-product">
                  <Nav.Link>Agregar Producto</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/add-post">
                  <Nav.Link>Subir Publicación</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/create-slot">
                  <Nav.Link>Agregar Horas</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/profile">
              <Nav.Link>Perfil</Nav.Link>
            </LinkContainer>
              </>
            )}
            {userRole === 'designer' && (
              <>
                <LinkContainer to="/upload-design">
                  <Nav.Link>Subir Diseño</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/models/add">
                  <Nav.Link>Añadir Diseño 3D</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/postulaciones-list">
                <Nav.Link>Postulaciones</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/profile">
              <Nav.Link>Perfil</Nav.Link>
            </LinkContainer>
              </>
            )}
            {userRole === 'admin' && (
              <><LinkContainer to="/postulaciones-list">
                <Nav.Link>Postulaciones</Nav.Link>
              </LinkContainer><LinkContainer to="/profile">
                  <Nav.Link>Perfil</Nav.Link>
                </LinkContainer></>
              
            )}

            {userRole === 'client' && (
              <>
                <LinkContainer to="/reserve-slot">
                  <Nav.Link>Mis Citas</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/profile">
                  <Nav.Link>Perfil</Nav.Link>
                </LinkContainer>
              </>
            )}
            <LinkContainer to="/cart">
              <Nav.Link>Carrito</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/posts-list">
              <Nav.Link>Publicaciones</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/design-gallery">
                  <Nav.Link>Diseños</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/models">
                  <Nav.Link>Diseños 3D</Nav.Link>
                </LinkContainer>   
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;