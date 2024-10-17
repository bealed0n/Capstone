-- Crear la base de datos
CREATE DATABASE "ign-tattoo-test";

-- Conectar a la base de datos
USE "ign-tattoo-test";

-- Crear la tabla de usuarios
CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_pic VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    -- Por defecto será 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos usuarios de ejemplo
INSERT INTO users
    (username, email, password, role)
VALUES
    ('user1', 'a@a', '123', 'user'),
    -- Usuario normal
    ('tattoer', 'a@a2', '123', 'tattoo_artist'),
    -- Tatuador
    ('designer', 'a@a3', '123', 'designer');
-- Designer

-- Crear la tabla de seguidores
CREATE TABLE followers
(
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, follower_id)
);

-- Crear la tabla de mensajes
CREATE TABLE messages
(
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Crear la tabla de posts
CREATE TABLE posts
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de likes
CREATE TABLE likes
(
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- Crear la tabla de comentarios
CREATE TABLE comments
(
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de citas
CREATE TABLE appointments
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT
);

-- Crear la tabla de relación de seguimiento de usuarios (opcional si no se usa la tabla followers)
CREATE TABLE follows
(
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- Confirmar que todo esté funcionando correctamente con algunas consultas de ejemplo
-- Consultar los usuarios
SELECT *
FROM users;

-- Consultar los posts
SELECT *
FROM posts;

-- Consultar los seguidores
SELECT *
FROM followers;

--Codigo generado por CHATGPT

