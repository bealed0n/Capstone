const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté correctamente configurada

// Controlador para obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products');
    res.json(products.rows);
  } catch (err) {
    console.error('Error al obtener productos:', err.message);
    res.status(500).json('Error del servidor');
  }
};

// Controlador para agregar un producto
const addProducts = async (req, res) => {
  console.log("prueba");
  console.log("req.user:", req.user); // Verificar el contenido de req.user

  const { name, description, price, stock } = req.body;
  const imageUrl = req.file ? req.file.filename : null; // Asigna la ruta de la imagen si existe

  // Definir userId correctamente
  const userId = req.user && req.user.id;
  if (!userId) {
    return res.status(401).json({ msg: 'Autenticación requerida' });
  }

  try {
    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, image_url, stock, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, imageUrl, stock, userId]
    );

    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error('Error al agregar producto:', err.message);
    res.status(500).json('Error del servidor');
  }
};
// Ruta para obtener los detalles de un producto específico
const getId = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    res.json(product.rows[0]);
  } catch (err) {
    console.error('Error al obtener el producto:', err.message);
    res.status(500).json('Error del servidor');
  }
};

module.exports = { getProducts, addProducts, getId };
