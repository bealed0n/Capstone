// server/db.js
const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',         // Usuario de PostgreSQL
  host: 'localhost',        // Dirección del servidor
  database: 'ign_tatto',   // Nombre de la base de datos
  password: 'admin',// Contraseña del usuario de PostgreSQL
  port: 5432,               // Puerto de PostgreSQL (por defecto es 5432)
});

module.exports = pool;
