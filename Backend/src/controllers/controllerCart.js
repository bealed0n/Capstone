const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté correctamente configurada

const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Autenticación requerida' });
    }
  
    if (!productId) {
      return res.status(400).json({ msg: 'El ID del producto es requerido' });
    }
  
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ msg: 'La cantidad debe ser mayor que 0' });
    }
  
    try {
      // Verificar si el producto ya está en el carrito
      const existingCartItem = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
  
      if (existingCartItem.rows.length > 0) {
        // Actualizar la cantidad del producto en el carrito
        const updatedCartItem = await pool.query(
          'UPDATE cart SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3 RETURNING *',
          [quantity, userId, productId]
        );
        return res.json(updatedCartItem.rows[0]);
      } else {
        // Agregar el producto al carrito
        const newCartItem = await pool.query(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
          [userId, productId, quantity]
        );
        return res.status(201).json(newCartItem.rows[0]);
      }
    } catch (err) {
      console.error('Error al agregar producto al carrito:', err.message);
      res.status(500).json('Error del servidor');
    }
  };
// Controlador para obtener el contenido del carrito
const getCart = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) {
    return res.status(401).json({ msg: 'Autenticación requerida' });
  }

  try {
    const cartItems = await pool.query(
      'SELECT c.id, c.quantity, p.name, p.description, p.price, p.image_url FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1',
      [userId]
    );
    res.json(cartItems.rows);
  } catch (err) {
    console.error('Error al obtener el carrito:', err.message);
    res.status(500).json('Error del servidor');
  }
};

// Controlador para actualizar la cantidad de un producto en el carrito
const updateCartItem = async (req, res) => {
    const { cartItemId, quantity } = req.body;
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Autenticación requerida' });
    }
  
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ msg: 'La cantidad debe ser mayor que 0' });
    }
  
    try {
      const updatedCartItem = await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
        [quantity, cartItemId, userId]
      );
  
      if (updatedCartItem.rows.length === 0) {
        return res.status(404).json({ msg: 'Producto no encontrado en el carrito' });
      }
  
      res.json(updatedCartItem.rows[0]);
    } catch (err) {
      console.error('Error al actualizar el carrito:', err.message);
      res.status(500).json('Error del servidor');
    }
  };
  

// Controlador para eliminar un producto del carrito
const removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;
  const userId = req.user && req.user.id;
  if (!userId) {
    return res.status(401).json({ msg: 'Autenticación requerida' });
  }

  try {
    const deletedCartItem = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
      [cartItemId, userId]
    );

    if (deletedCartItem.rows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado en el carrito' });
    }

    res.json({ msg: 'Producto eliminado del carrito' });
  } catch (err) {
    console.error('Error al eliminar producto del carrito:', err.message);
    res.status(500).json('Error del servidor');
  }
};

module.exports = { addToCart, getCart, updateCartItem, removeFromCart };