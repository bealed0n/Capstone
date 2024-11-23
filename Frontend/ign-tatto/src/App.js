// src/App.js
import React, { useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes,  Navigate  } from 'react-router-dom';
import Home from './pages/Home/Home';
import RegistroClient from './pages/Registros/registroClient';
import Login from './pages/Login/Login';
import Navbar from './components/NavBar';
import Profile from './pages/Profile/Profile';
import BotonChatbot from './components/BotonChatbot'; // Asegúrate de que la ruta sea correcta
import AddProduct from './pages/Products/addProducts';
import ProductList from './pages/Products/productList';
import ProductDetail from './pages/Products/ProductDetail'; // Asegúrate de que la ruta sea correcta
import PostList from './pages/Posts/postList';
import { ProtectedRoutes } from './components/ProtectedRoutes';
import AddPost from './pages/Posts/addPost';
import 'bootstrap/dist/css/bootstrap.min.css';
import PostulacionForm from './pages/postulacion/PostulacionForm';  
import PostulacionesList from './pages/postulacion/PostulacionesList';
import HumanModel3D from './pages/Model3d/HumanModel3D';
import Cart from './components/Cart';
import { CartProvider } from './context/CartContext';
import PublishHours from './pages/Booking/PublishHours'; // Importar el componente
import ReserveHour from './pages/Booking/ReserveHour'; // Importar el componente
function App() {

  return (
    <CartProvider>
    <Router>
      <Navbar /> {/* Incluir el Navbar */}
      <Routes>
        <Route path="/"  element={<Home />} />
        <Route path="/client/register" element={<RegistroClient />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-product" element={<ProtectedRoutes allowedRole={"tattoo_artist"} element={<AddProduct />} />} />
        <Route path="/products-lists" element={<ProductList />} />
        <Route path="/productos/:id" element={<ProductDetail />} /> {/* Ruta para detalles del producto */}
        <Route path="/posts-list" element={<PostList />} />
        <Route path="/add-post"  element={<ProtectedRoutes allowedRole={"tattoo_artist"} element={<AddPost />} />} />
        <Route path="/postulaciones-list" element={<PostulacionesList />} />
        <Route path="/postulacion-form" element={<PostulacionForm />} />
        <Route path="/model3d" element={<HumanModel3D />} />
        <Route path="/create-slot" element={<PublishHours />} />
        <Route path="/reserve-slot" element={<ReserveHour />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      <BotonChatbot /> {/* Incluir el componente Chatbot */}
    </Router>
    </CartProvider>
  );
}

export default App;