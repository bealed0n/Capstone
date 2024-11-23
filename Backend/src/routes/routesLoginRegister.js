const express = require('express');
const router = express.Router();
const { addClient,
    addTattoArtist,
    addDesigner,
    addLogin,
    getProfile
    } = require('../controllers/controllerLoginRegister');
const Middleware = require('../middlewares/auth');
    
// Ruta para obtener todos los productos
router.post('/client/register', addClient);
router.post('/tatto_artist/register', addTattoArtist);
router.post('/designer/register', addDesigner);
router.post('/login', addLogin);
router.get('/profile', Middleware, getProfile);

module.exports = router;
