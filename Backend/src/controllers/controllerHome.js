// controllerHome.js
const pool = require('../db');

// Función para obtener datos aleatorios para la home
const getHomeData = async (req, res) => {
  try {
    const [tattooReviews, products, posts] = await Promise.all([
      pool.query('SELECT * FROM tattoo_artist_reviews ORDER BY RANDOM() LIMIT 5'),
      pool.query('SELECT * FROM products ORDER BY RANDOM() LIMIT 5'),
      pool.query('SELECT * FROM posts ORDER BY RANDOM() LIMIT 5')
    ]);

    res.status(200).json({
      tattooReviews: tattooReviews.rows,
      products: products.rows,
      posts: posts.rows
    });
  } catch (err) {
    console.error('Error al obtener los datos de la home:', err);
    res.status(500).json({ msg: 'Error al obtener los datos de la home' });
  }
};

module.exports = { getHomeData };