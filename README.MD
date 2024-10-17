# Proyecto Full Stack con React Native y Express.js

Proyecto de red social movil en una aplicación móvil con un front-end desarrollado en **React Native** (Expo) y un back-end en **Express.js**. A continuacion los pasos a seguir de la instalacion correcta de este.
* El proyecto esta en constante desarrollo por lo que es probable que la base de datos no este actualizada

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
### 3. Configuración de la Base de Datos

El proyecto utiliza **PostgreSQL** como base de datos. Aquí tienes la estructura básica de las tablas:

#### 1. **Usuarios (`users`)**

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|--------------------------------------------|
| `id`         | SERIAL       | Identificador único del usuario            |
| `username`   | VARCHAR(50)  | Nombre de usuario                          |
| `email`      | VARCHAR(100) | Correo electrónico del usuario             |
| `password`   | VARCHAR(255) | Contraseña cifrada                         |
| `bio`        | TEXT         | Descripción del usuario                    |
| `profile_pic`| VARCHAR(255) | URL de la imagen de perfil                 |
| `role`       | VARCHAR(50)  | Rol del usuario (usuario o tatuador)       |
| `created_at` | TIMESTAMP    | Fecha de creación de la cuenta             |

#### 2. **Seguidores (`followers`)**

| Columna      | Tipo     | Descripción                                |
|--------------|----------|--------------------------------------------|
| `user_id`    | INTEGER  | ID del usuario que sigue                   |
| `follower_id`| INTEGER  | ID del usuario que está siendo seguido      |
| `followed_at`| TIMESTAMP| Fecha en la que comenzó a seguir            |

#### 3. **Mensajes (`messages`)**

| Columna        | Tipo         | Descripción                                |
|----------------|--------------|--------------------------------------------|
| `id`           | SERIAL       | Identificador único del mensaje            |
| `sender_id`    | INTEGER      | ID del usuario que envía el mensaje        |
| `receiver_id`  | INTEGER      | ID del usuario que recibe el mensaje       |
| `content`      | TEXT         | Contenido del mensaje                      |
| `sent_at`      | TIMESTAMP    | Fecha y hora del envío                     |
| `is_read`      | BOOLEAN      | Estado de lectura del mensaje              |

#### 4. **Posts (`posts`)**

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|--------------------------------------------|
| `id`         | SERIAL       | Identificador único del post               |
| `user_id`    | INTEGER      | ID del usuario que publicó el post         |
| `content`    | TEXT         | Contenido del post                         |
| `image`      | VARCHAR(255) | URL de la imagen asociada al post (opcional)|
| `created_at` | TIMESTAMP    | Fecha y hora de la publicación              |

#### 5. **Likes (`likes`)**

| Columna      | Tipo     | Descripción                                |
|--------------|----------|--------------------------------------------|
| `post_id`    | INTEGER  | ID del post al que se le dio like          |
| `user_id`    | INTEGER  | ID del usuario que dio el like             |
| `liked_at`   | TIMESTAMP| Fecha y hora en que se dio el like         |

#### 6. **Comentarios (`comments`)**

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|--------------------------------------------|
| `id`         | SERIAL       | Identificador único del comentario         |
| `post_id`    | INTEGER      | ID del post comentado                      |
| `user_id`    | INTEGER      | ID del usuario que hizo el comentario      |
| `content`    | TEXT         | Contenido del comentario                   |
| `created_at` | TIMESTAMP    | Fecha de creación del comentario           |

#### 7. **Citas (`appointments`)**

| Columna        | Tipo         | Descripción                                |
|----------------|--------------|--------------------------------------------|
| `id`           | SERIAL       | Identificador único de la cita             |
| `user_id`      | INTEGER      | ID del usuario que agenda la cita          |
| `date`         | DATE         | Fecha de la cita                           |
| `time`         | TIME         | Hora de la cita                            |
| `description`  | TEXT         | Descripción de la cita                     |

## Uso

Cuando los dos servidores estén ejecutando, puedes abrir el proyecto con android studio o en tu dispositivo móvil mediante la app de **Expo Go** escaneando el código QR.

---

## Estructura del Proyecto

```
tu-repositorio/
│
├── backend-ign-tattoo-app/     # Código del servidor (Express.js)
├── frontend-ign-tatoo-app/    # Código del cliente (React Native)
│
└── README.md    # Documentación del proyecto
```
