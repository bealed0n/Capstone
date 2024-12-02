const express = require('express');
const router = express.Router();
const { addClient,
    addTattoArtist,
    addDesigner,
    addLogin,
    getProfile,
    getUserProfile, 
    searchUsers,
    followUser, 
    unfollowUser,
    updateUser,
    } = require('../controllers/controllerLoginRegister');
const Middleware = require('../middlewares/auth');
    
// Ruta para obtener todos los productos
router.post('/client/register', addClient);
router.post('/tatto_artist/register', addTattoArtist);
router.post('/designer/register', addDesigner);
router.post('/login', addLogin);
router.get('/profile', Middleware, getProfile);
// Ruta para obtener el perfil de un usuario específico
router.get('/profile/:userId', Middleware, getUserProfile);
// Ruta para buscar usuarios por nombre
router.get('/search', searchUsers)
router.post('/follow', Middleware, followUser);
router.post('/unfollow', Middleware, unfollowUser);
router.put('/users/:id', Middleware, updateUser);



module.exports = router;
