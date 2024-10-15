// src/pages/ProductDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetails = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await axios.get(`/products/${id}`);
      setProduct(response.data);
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="container mt-5">Cargando...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={product.image_url || 'https://via.placeholder.com/400x300'}
            alt={product.name}
            className="img-fluid"
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p><strong>Precio: </strong>${product.price}</p>
          <p><strong>Stock: </strong>{product.stock}</p>
          <button
            className="btn btn-success btn-lg"
            onClick={() => {
              addToCart(product);
              navigate('/cart');
            }}
          >
            Añadir al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
