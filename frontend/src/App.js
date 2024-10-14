// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import TattooPreview from './pages/TattooPreview';
import Booking from './pages/Booking';
import Register from './pages/Register';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddProduct from './pages/AddProduct';
import Navbar from './components/Navbar'; // Importar el componente Navbar
import ClientRegister from './pages/ClientRegister';
import TattooArtistRegister from './pages/TattooArtistRegister';
import DesignerRegister from './pages/DesignerRegister';
import HumanModel3D from './pages/HumanModel3D';

function App() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const removeFromCart = (index) => {
    const newCartItems = cartItems.filter((item, i) => i !== index);
    setCartItems(newCartItems);
  };

  return (
    <Router>
      <Navbar /> {/* Incluir el Navbar */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<TattooPreview />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cartItems={cartItems} removeFromCart={removeFromCart} />} />
        <Route path="/add-product" element={<AddProduct />} /> {/* Nueva ruta */}
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/tattoo_artist/register" element={<TattooArtistRegister />} />
        <Route path="/designer/register" element={<DesignerRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/model3d" element={<HumanModel3D />} />
      </Routes>
    </Router>
  );
}

export default App;
