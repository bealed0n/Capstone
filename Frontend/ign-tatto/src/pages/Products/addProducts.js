// frontend/src/components/AddProduct.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import productImage from '../../assets/producto.jpg'; // Reemplaza con la ruta correcta a tu imagen
import './addProduct.css'; // Importa el nuevo archivo CSS


const AddProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();


  const categories = [
    'cartuchos',
    'maquinas',
    'cuidado',
    'insumos',
    'tintas',
    'otros'
  ];


  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('category', category);
      if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }


      const response = await axios.post('http://localhost:4000/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });


      console.log('Producto agregado:', response.data);


      setSuccess('Producto agregado exitosamente.');
      setError(null);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory('');
      setImage(null);
      navigate('/products-lists'); // Redirige a la lista de productos después de agregar
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setError('Error al agregar producto. Intenta nuevamente.');
      setSuccess(null);
    }
  };


  return (
    <div className="add-product-container">
      <div className="add-product-image-container">
        <img src={productImage} alt="Agregar Producto" className="add-product-image" />
      </div>
      <div className="add-product-form-container">
        <form className="add-product-form" onSubmit={handleAddProduct}>
          <h2>Agregar Producto</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}


          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ingresa el nombre del producto"
            />
          </div>


          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ingresa la descripción del producto"
            ></textarea>
          </div>


          <div className="form-group">
            <label htmlFor="price">Precio:</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="Ingresa el precio del producto"
            />
          </div>


          <div className="form-group">
            <label htmlFor="stock">Stock:</label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              placeholder="Cantidad disponible"
            />
          </div>


          <div className="form-group">
            <label htmlFor="category">Categoría:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>


          <div className="form-group">
            <label htmlFor="image">Imagen:</label>
            <input
              type="file"
              id="image"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>


          <button type="submit" className="btn-submit">Agregar Producto</button>
        </form>
      </div>
    </div>
  );
};


export default AddProduct;

