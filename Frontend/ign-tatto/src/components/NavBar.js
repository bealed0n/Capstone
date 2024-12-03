import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Image } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Importación por defecto
import cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import './navbar.css'; // Importar el archivo CSS personalizado

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
    <Navbar bg="dark" className="navbar-custom" variant="dark" expand="lg">
      <Container fluid>
        {/* Branding alineado a la izquierda */}
        <Navbar.Brand as={Link} to="/" className="navbar-brand-custom ms-0">
          <Image src="/assets/navbar.png" alt="Logo" width="60" height="60" className="d-inline-block align-top" />{' '}
          IGN.TATTO
        </Navbar.Brand>

        {/* Toggler para pantallas pequeñas */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* Enlaces de navegación alineados a la derecha */}
          <Nav className="ms-auto">
            <LinkContainer to="/">
              <Nav.Link>Inicio</Nav.Link>
            </LinkContainer>
            <NavDropdown title="Comencemos!" id="account-nav-dropdown" className="nav-link-custom">
              <LinkContainer to="/client/register">
                <NavDropdown.Item>Registro Cliente</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="postulacion-form">
                <NavDropdown.Item>¿quieres ser un tatuador/diseñado?</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/login">
              <NavDropdown.Item>Login</NavDropdown.Item>
            </LinkContainer>
            </NavDropdown>
            <LinkContainer to="/products-lists">
              <Nav.Link>Productos</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/search">
              <Nav.Link>Buscador de Usuarios</Nav.Link>
            </LinkContainer>
            {/* Enlaces según el rol */}
            {userRole === 'tattoo_artist' && (
              <>
                  <NavDropdown title="Opciones de Tatuador" id="tattoo-artist-dropdown">
                <LinkContainer to="/add-product">
                  <NavDropdown.Item>Agregar Producto</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/add-post">
                  <NavDropdown.Item>Subir Publicación</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/create-slot">
                  <NavDropdown.Item>Agregar Horas</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <LinkContainer to="/profile">
                  <Nav.Link>Perfil</Nav.Link>
                </LinkContainer>
              </>
            )}
            {userRole === 'designer' && (
              <>
                <NavDropdown title="Opciones de diseñador" id="disigner-dropdown">
                <LinkContainer to="/upload-design">
                  <NavDropdown.Item>Subir Diseño</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/models/add">
                  <NavDropdown.Item>Subir Modelo 3D</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
                <LinkContainer to="/profile">
                  <Nav.Link>Perfil</Nav.Link>
                </LinkContainer>
              </>
            )}
            {userRole === 'admin' && (
              <>
                <LinkContainer to="/postulaciones-list">
                  <Nav.Link>Postulaciones</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/profile">
                  <Nav.Link>Perfil</Nav.Link>
                </LinkContainer>
                <NavDropdown title="Opciones de Administrador" id="admin-dropdown">
                <LinkContainer to="/admin/posts">
                  <NavDropdown.Item>Gestionar Publicaciones</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/products">
                  <NavDropdown.Item>Gestionar Productos</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/models">
                  <NavDropdown.Item>Gestionar Modelos 3D</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              </>
            )}
            {userRole === 'client' && (
              <>
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