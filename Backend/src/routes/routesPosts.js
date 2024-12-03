const express = require('express');
const router = express.Router();
const { getPost,addPost,} = require('../controllers/controllerPosts');
const Middleware = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const { addLike, removeLike, getLikesCount } = require('../controllers/likesController'); // Importa el controlador
const { addComment, getCommentsByPostId, deleteComment, deletePost } = require('../controllers/comentController');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'src/uploads'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada imagen
    }
  });
  
const upload = multer({ storage: storage });

// Ruta para obtener todos los productos
router.get('/post', getPost);
router.post('/addPost', Middleware, upload.single('imageUrl'), addPost);
// Ruta para dar "Me gusta" a una publicación
router.post('/:postId/like', Middleware, addLike);

// Ruta para quitar "Me gusta" de una publicación
router.delete('/:postId/removeLike', Middleware, removeLike);

// Ruta para obtener el número de "Me gusta" de una publicación
router.get('/:postId/likes-count', Middleware, getLikesCount);

// Ruta para añadir un comentario a un post
router.post('/:postId/addcomment', Middleware, addComment);

// Ruta para obtener todos los comentarios de un post específico
router.get('/:postId/getcomment', Middleware, getCommentsByPostId);

// Ruta para eliminar un comentario (solo el propietario del comentario puede eliminarlo)
router.delete('/delete/:commentId', Middleware, deleteComment);



module.exports = router;
