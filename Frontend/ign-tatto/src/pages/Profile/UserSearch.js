// src/components/UserSearch.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import './UserSearch.css'; // Opcional: para estilos

const UserSearch = () => {
    const [username, setUsername] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/search`, {
                params: { username },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                withCredentials: true
            });
            console.log('API response:', response.data); // Verifica la respuesta de la API
            setResults(response.data);
            setError(null);
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            setError('Error al buscar usuarios. Intenta nuevamente.');
        }
    };

    const handleProfileClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <Container className="user-search-container">
            <h2>Buscar Usuarios</h2>
            <Form>
                <Form.Group controlId="username">
                    <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nombre de usuario"
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleSearch} className="mt-3">
                    Buscar
                </Button>
            </Form>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            <ListGroup className="user-search-results mt-3">
                {results.length === 0 && <ListGroup.Item>No se encontraron usuarios</ListGroup.Item>}
                {results.map(user => (
                    <ListGroup.Item key={user.id} action onClick={() => handleProfileClick(user.id)}>
                        {user.username}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default UserSearch;