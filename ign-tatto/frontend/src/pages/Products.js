// src/pages/Products.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/products');
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.error('La respuesta no es un array:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Productos Disponibles</h2>
      <div className="row">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="col-md-4">
              <div className="card mb-4 shadow-sm">
                <img
                  src={product.image_url || 'https://via.placeholder.com/300x200'}
                  className="card-img-top"
                  alt={product.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="card-text"><strong>Precio: </strong>${product.price}</p>
                  <p className="card-text"><strong>Stock: </strong>{product.stock}</p>
                  <Link to={`/products/${product.id}`} className="btn btn-outline-primary btn-block">
                    Ver Detalles
                  </Link>
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

export default Products;
