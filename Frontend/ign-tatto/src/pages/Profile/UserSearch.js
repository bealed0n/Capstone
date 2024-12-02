// src/components/UserSearch.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserSearch.css'; // Opcional: para estilos

const UserSearch = () => {
    const [username, setUsername] = useState('');
    const [results, setResults] = useState([]);
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
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
        }
    };

    const handleProfileClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="user-search-container">
            <h2>Buscar Usuarios</h2>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
            />
            <button onClick={handleSearch}>Buscar</button>
            <ul className="user-search-results">
                {results.length === 0 && <li>No se encontraron usuarios</li>}
                {results.map(user => (
                    <li key={user.id} onClick={() => handleProfileClick(user.id)}>
                        {user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserSearch;