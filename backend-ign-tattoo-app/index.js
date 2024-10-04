
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');

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

    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);

        if (rows.length > 0) {
            const user = rows[0];
            const isValidPassword = await bcrypt.compare(password, user.password); // Compara la contraseña

            if (isValidPassword) {
                // Responde con el usuario
                res.json({ success: true, user: { username: user.username, email: user.email } });
            } else {
                res.json({ success: false, message: 'Contraseña incorrecta' });
            }
        } else {
            res.json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.log(error);
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hashea la contraseña

        // Inserta el nuevo usuario en la base de datos
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
        await pool.query(query, [username, email, hashedPassword]);

        // Aquí deberías establecer el usuario en el contexto del front-end
        // Por ejemplo, si tienes una llamada al front-end que guarda el usuario
        res.json({ success: true, user: { username, email } });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.json({ success: false, message: 'Error al registrar usuario' });
    }
});



app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});