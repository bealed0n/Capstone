# Proyecto Full Stack con React Native y Express.js

Proyecto de red social movil en una aplicación móvil con un front-end desarrollado en **React Native** (Expo) y un back-end en **Express.js**. A continuacion los pasos a seguir de la instalacion correcta de este.

- El proyecto esta en constante desarrollo por lo que es probable que la base de datos no este actualizada

## Requisitos

Riquisito obligatorio:

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [PostgreSQL](https://www.postgresql.org/) (versión 12 o superior)
- Un gestor de paquetes como [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd Capstone
```

### 2. Instalación de dependencias

#### Back-End

1. Navega a la carpeta del back-end:

   ```bash
   cd backend-ign-tattoo-app
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

#### Front-End

1. Navega a la carpeta del front-end:

   ```bash
   cd ../frontend-ign-tattoo-app
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el proyecto Expo:

   ```bash
   npx expo start
   ```

## Configuración de la Base de Datos

El proyecto utiliza PostgreSQL como base de datos. Aquí tienes la estructura básica de las tablas:

### 1. Usuarios (users)

Esta tabla almacena los datos básicos de cada usuario.

| Columna     | Tipo         | Descripción                           |
| ----------- | ------------ | ------------------------------------- |
| id          | SERIAL       | Identificador único del usuario       |
| username    | VARCHAR(50)  | Nombre de usuario                     |
| email       | VARCHAR(100) | Correo electrónico del usuario        |
| password    | VARCHAR(255) | Contraseña cifrada                    |
| bio         | TEXT         | Descripción del usuario               |
| profile_pic | VARCHAR(255) | URL de la imagen de perfil            |
| created_at  | TIMESTAMP    | Fecha de creación de la cuenta        |
| role        | VARCHAR(50)  | Rol del usuario (por ejemplo, 'user') |

### 2. Seguidores (follows)

Esta tabla crea la relación de "seguir" entre usuarios.

| Columna      | Tipo      | Descripción                            |
| ------------ | --------- | -------------------------------------- |
| follower_id  | INTEGER   | ID del usuario que sigue               |
| following_id | INTEGER   | ID del usuario que está siendo seguido |
| followed_at  | TIMESTAMP | Fecha en la que comenzó a seguir       |

### 3. Posts (posts)

Almacena los posts que los usuarios publican.

| Columna    | Tipo         | Descripción                        |
| ---------- | ------------ | ---------------------------------- |
| id         | SERIAL       | Identificador único del post       |
| user_id    | INTEGER      | ID del usuario que publicó el post |
| content    | TEXT         | Contenido del post                 |
| image      | VARCHAR(255) | URL de la imagen asociada al post  |
| created_at | TIMESTAMP    | Fecha y hora de la publicación     |

### 4. Likes (likes)

Almacena los likes que reciben los posts.

| Columna  | Tipo      | Descripción                        |
| -------- | --------- | ---------------------------------- |
| post_id  | INTEGER   | ID del post al que se le dio like  |
| user_id  | INTEGER   | ID del usuario que dio el like     |
| liked_at | TIMESTAMP | Fecha y hora en que se dio el like |

### 5. Comentarios (comments)

Esta tabla almacena los comentarios en los posts.

| Columna    | Tipo      | Descripción                           |
| ---------- | --------- | ------------------------------------- |
| id         | SERIAL    | Identificador único del comentario    |
| post_id    | INTEGER   | ID del post comentado                 |
| user_id    | INTEGER   | ID del usuario que hizo el comentario |
| content    | TEXT      | Contenido del comentario              |
| created_at | TIMESTAMP | Fecha de creación del comentario      |

### 6. Citas (appointments)

Tabla para gestionar las citas de los usuarios.

| Columna             | Tipo        | Descripción                                |
| ------------------- | ----------- | ------------------------------------------ |
| id                  | SERIAL      | Identificador único de la cita             |
| user_id             | INTEGER     | ID del usuario que agenda la cita          |
| tattoo_artist_id    | INTEGER     | ID del tatuador                            |
| date                | DATE        | Fecha de la cita                           |
| time                | TIME        | Hora de la cita                            |
| description         | TEXT        | Descripción de la cita                     |
| status              | VARCHAR(20) | Estado de la cita (por ejemplo, 'pending') |
| reference_image_url | TEXT        | URL de la imagen de referencia             |

### 7. Disponibilidad del Tatuador (tattoo_artist_availability)

Tabla para gestionar la disponibilidad de los tatuadores.

| Columna          | Tipo    | Descripción                              |
| ---------------- | ------- | ---------------------------------------- |
| id               | SERIAL  | Identificador único de la disponibilidad |
| tattoo_artist_id | INTEGER | ID del tatuador                          |
| date             | DATE    | Fecha de disponibilidad                  |
| start_time       | TIME    | Hora de inicio de la disponibilidad      |
| end_time         | TIME    | Hora de fin de la disponibilidad         |
| is_available     | BOOLEAN | Indica si el tatuador está disponible    |
| description      | TEXT    | Descripción de la disponibilidad         |

### 8. Aplicaciones de Tatuadores (tattooist_applications)

Tabla para gestionar las aplicaciones de los usuarios para convertirse en tatuadores.

| Columna            | Tipo         | Descripción                                      |
| ------------------ | ------------ | ------------------------------------------------ |
| id                 | SERIAL       | Identificador único de la aplicación             |
| user_id            | INTEGER      | ID del usuario que aplica                        |
| carnet_image       | VARCHAR(255) | URL de la imagen del carnet                      |
| antecedentes_image | VARCHAR(255) | URL de la imagen de antecedentes                 |
| description        | TEXT         | Descripción de la aplicación                     |
| status             | VARCHAR(20)  | Estado de la aplicación (por ejemplo, 'pending') |
| created_at         | TIMESTAMP    | Fecha de creación de la aplicación               |

### 9. Mensajes (messages)

Tabla para gestionar los mensajes entre usuarios.

| Columna     | Tipo      | Descripción                          |
| ----------- | --------- | ------------------------------------ |
| id          | SERIAL    | Identificador único del mensaje      |
| sender_id   | INTEGER   | ID del usuario que envía el mensaje  |
| receiver_id | INTEGER   | ID del usuario que recibe el mensaje |
| content     | TEXT      | Contenido del mensaje                |
| image_url   | TEXT      | URL de la imagen asociada al mensaje |
| sent_at     | TIMESTAMP | Fecha y hora de envío del mensaje    |
| is_read     | BOOLEAN   | Indica si el mensaje ha sido leído   |

### 10. Proyectos de Diseño (designer_projects)

Tabla para gestionar los proyectos de diseño de los usuarios.

| Columna      | Tipo          | Descripción                              |
| ------------ | ------------- | ---------------------------------------- |
| id           | SERIAL        | Identificador único del proyecto         |
| designer_id  | INTEGER       | ID del diseñador                         |
| title        | VARCHAR(255)  | Título del proyecto                      |
| description  | TEXT          | Descripción del proyecto                 |
| image        | VARCHAR(255)  | URL de la imagen del proyecto            |
| price        | DECIMAL(10,2) | Precio del proyecto                      |
| created_at   | TIMESTAMP     | Fecha de creación del proyecto           |
| currency     | VARCHAR(10)   | Moneda del precio                        |
| is_available | BOOLEAN       | Indica si el proyecto está disponible    |
| is_requested | BOOLEAN       | Indica si el proyecto ha sido solicitado |

### 11. Diseños Solicitados (requested_design)

Tabla para gestionar los diseños solicitados por los usuarios.

| Columna     | Tipo          | Descripción                                           |
| ----------- | ------------- | ----------------------------------------------------- |
| id          | SERIAL        | Identificador único del diseño solicitado             |
| user_id     | INTEGER       | ID del usuario que solicita el diseño                 |
| designer_id | INTEGER       | ID del diseñador                                      |
| project_id  | INTEGER       | ID del proyecto de diseño                             |
| price       | DECIMAL(10,2) | Precio del diseño solicitado                          |
| status      | VARCHAR(20)   | Estado del diseño solicitado (por ejemplo, 'pending') |
| created_at  | TIMESTAMP     | Fecha de creación del diseño solicitado               |
| image       | VARCHAR(255)  | URL de la imagen del diseño solicitado                |

### 12. Invitaciones de Estudio (studio_invitations)

Tabla para gestionar las invitaciones de estudio.

| Columna          | Tipo        | Descripción                                      |
| ---------------- | ----------- | ------------------------------------------------ |
| id               | SERIAL      | Identificador único de la invitación             |
| studio_id        | INTEGER     | ID del estudio                                   |
| slot_id          | INTEGER     | ID del slot                                      |
| tattoo_artist_id | INTEGER     | ID del tatuador                                  |
| status           | VARCHAR(20) | Estado de la invitación (por ejemplo, 'pending') |
| created_at       | TIMESTAMP   | Fecha de creación de la invitación               |
| updated_at       | TIMESTAMP   | Fecha de actualización de la invitación          |

### 13. Slots de Estudio (studio_slots)

Tabla para gestionar los slots de estudio.

| Columna                   | Tipo      | Descripción                       |
| ------------------------- | --------- | --------------------------------- |
| id                        | SERIAL    | Identificador único del slot      |
| studio_id                 | INTEGER   | ID del estudio                    |
| slot_number               | INTEGER   | Número del slot                   |
| assigned_tattoo_artist_id | INTEGER   | ID del tatuador asignado al slot  |
| is_available              | BOOLEAN   | Indica si el slot está disponible |
| created_at                | TIMESTAMP | Fecha de creación del slot        |

### 14. Estudios de Tatuajes (tattoo_studios)

Tabla para gestionar los estudios de tatuajes.

| Columna     | Tipo         | Descripción                                |
| ----------- | ------------ | ------------------------------------------ |
| id          | SERIAL       | Identificador único del estudio            |
| owner_id    | INTEGER      | ID del propietario del estudio             |
| name        | VARCHAR(255) | Nombre del estudio                         |
| address     | VARCHAR(255) | Dirección del estudio                      |
| description | TEXT         | Descripción del estudio                    |
| image_url   | VARCHAR(255) | URL de la imagen del estudio               |
| created_at  | TIMESTAMP    | Fecha de creación del estudio              |
| status      | VARCHAR(20)  | Estado del estudio (por ejemplo, 'active') |

## Uso

Cuando los dos servidores estén ejecutando, puedes abrir el proyecto con android studio o en tu dispositivo móvil mediante la app de **Expo Go** escaneando el código QR.

- README generado con chatgpt

---

## Estructura del Proyecto

```
Capstone/
│
├── backend-ign-tattoo-app/     # Código del servidor (Express.js)
├── frontend-ign-tatoo-app/    # Código del cliente (React Native)
│
└── README.md    # Documentación del proyecto
```
