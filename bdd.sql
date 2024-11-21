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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos usuarios de ejemplo
INSERT INTO users
    (username, email, password, role)
VALUES
    ('cliente', 'a@a', '123', 'user'),
    ('tattoer', 'a@a2', '123', 'tattoo_artist'),
    ('designer', 'a@a3', '123', 'designer');

-- Crear la tabla de seguidores
CREATE TABLE follows
(
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
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
    tattoo_artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    reference_image_url TEXT
);

-- Crear la tabla de disponibilidad del tatuador
CREATE TABLE tattoo_artist_availability
(
    id SERIAL PRIMARY KEY,
    tattoo_artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- Crear la tabla de aplicaciones de tatuadores
CREATE TABLE tattooist_applications
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    carnet_image VARCHAR(255),
    antecedentes_image VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de mensajes
CREATE TABLE messages
(
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Crear la tabla de proyectos de diseño
CREATE TABLE designer_projects
(
    id SERIAL PRIMARY KEY,
    designer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    currency VARCHAR(10),
    is_available BOOLEAN DEFAULT TRUE,
    is_requested BOOLEAN DEFAULT FALSE
);

-- Crear la tabla de diseños solicitados
CREATE TABLE requested_design
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    designer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES designer_projects(id) ON DELETE CASCADE,
    price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image VARCHAR(255)
);

-- Crear la tabla de invitaciones de estudio
CREATE TABLE studio_invitations
(
    id SERIAL PRIMARY KEY,
    studio_id INTEGER REFERENCES tattoo_studios(id) ON DELETE CASCADE,
    slot_id INTEGER,
    tattoo_artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de slots de estudio
CREATE TABLE studio_slots
(
    id SERIAL PRIMARY KEY,
    studio_id INTEGER REFERENCES tattoo_studios(id) ON DELETE CASCADE,
    slot_number INTEGER,
    assigned_tattoo_artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de estudios de tatuajes
CREATE TABLE tattoo_studios
(
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Consultar los usuarios
SELECT *
FROM users;

-- Consultar los posts
SELECT *
FROM posts;

-- Consultar los seguidores
SELECT *
FROM follows;