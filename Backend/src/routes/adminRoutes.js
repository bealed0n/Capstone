const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
// Eliminar post
router.delete('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    await post.remove();
    res.json({ message: 'Post eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el post' });
  }
});

// Eliminar producto
router.delete('/products/:id', authMiddleware, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        console.log('Producto no encontrado');
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      await product.remove();
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  });

// Eliminar modelo 3D
router.delete('/models/:id', authMiddleware, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: 'Modelo no encontrado' });
    }
    await model.remove();
    res.json({ message: 'Modelo eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el modelo' });
  }
});

module.exports = router;