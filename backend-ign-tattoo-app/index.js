const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Configuración de CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'admin-igntattoo',
    host: 'localhost',
    database: 'ign-tattoo-test',
    password: '1234',
    port: 5432,
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Aquí comparas las credenciales con tu usuario de prueba
    if (email === 'admin@example.com' && password === '1234') {
        res.json({ success: true, message: 'Login exitoso' });
    } else {
        res.json({ success: false, message: 'Credenciales inválidas' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});