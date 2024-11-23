const { Pool } = require('pg'); // Importa Pool en lugar de { pool }
const { db } = require('./config'); // Asegúrate de que config.js exporte un objeto db

const pool = new Pool({
    user: db.user,
    host: db.host,
    database: db.database,
    password: db.password,
    port: db.port
});

module.exports = pool;
