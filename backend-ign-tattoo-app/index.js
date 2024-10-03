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

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Aquí comparas las credenciales con tu usuario de prueba
    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        // Verifica si se encontró el usuario
        if (rows.length > 0) {
            const user = rows[0];

            // Compara la contraseña (aquí deberías usar una función de hash en producción)
            if (user.password === password) {
                res.json({ success: true, message: 'Login exitoso' });
                console.log('Login exitoso');
            } else {
                res.json({ success: false, message: 'Wrong password' });
            }
        } else {
            res.json({ success: false, message: 'Wrong password' });
        }
    }
    catch (error) {
        console.log(error);
    }
});
app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});