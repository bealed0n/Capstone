import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductList = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/products'); // Usa la ruta relativa gracias al proxy
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.error('La respuesta no es un array:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener productos:', error);
        setError('Error al cargar los productos');
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Productos</h2>
      {error && <div className="alert alert-danger">{error}</div>} {/* Mostrar mensaje de error si hay */}
      <div className="row">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={`http://localhost:5000${product.image_url}`} // Asegúrate de que esta URL esté correcta
                  className="card-img-top"
                  alt={product.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="card-text">${product.price}</p>
                  <Link to={`/products/${product.id}`} className="btn btn-primary">Ver Detalle</Link>
                  <Link to={`/reviews/add/${product.id}`} className="btn btn-secondary ml-2">Agregar Reseña</Link>
                  <button className="btn btn-success ml-2" onClick={() => addToCart(product)}>Agregar al Carrito</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No hay productos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;