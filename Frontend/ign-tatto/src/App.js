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
import Cart from './pages/Cart/Cart';
import PublishHours from './pages/Booking/PublishHours'; // Importar el componente
import ReserveHour from './pages/Booking/ReserveHour'; // Importar el componente
import UserProfile from './pages/Profile/UserProfile'; // Importar el componente UserProfile
import UserSearch from './pages/Profile/UserSearch'; // Importar el componente UserSearch
import ModelList from './pages/Models/ModelList';
import AddModel from './pages/Models/AddModel';
import ModelDetail from './pages/Models/ModelDetail';
import RequestPasswordReset from './pages/Login/RequestPasswordReset';
import UploadDesign from './pages/Models/UploadDesign';
import DesignGallery from './pages/Models/DesignGallery';
import DesignDetail from './pages/Models/DesignDetail';
import Checkout from './pages/Cart/Checkout';
import Footer from './components/Footer'; // Importa el componente Footer
import './App.css'; // Asegúrate de tener este archivo

function App() {

  return (
  <Router>
      <div className="content">
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
        <Route path="/postulaciones-list" element={<ProtectedRoutes allowedRole={"admin"}  element={<PostulacionesList />} />}/>
        <Route path="/postulacion-form" element={<PostulacionForm />} />
        <Route path="/model3d" element={<HumanModel3D />} />
        <Route path="/create-slot" element={<PublishHours />} />
        <Route path="/reserve-slot" element={<ReserveHour />} />
        <Route path="/cart"  element={<Cart />}  />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/search" element={<UserSearch />} />
        <Route path="/models" element={<ModelList />} />
        <Route path="/models/add" element={<ProtectedRoutes allowedRole={"designer"} element={<AddModel />} />} />
        <Route path="/models/:id" element={<ModelDetail />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/upload-design"  element={<ProtectedRoutes allowedRole={"designer"}  element={<UploadDesign />} />} />
        <Route path="/design-gallery" element={<DesignGallery />} />
        <Route path="/designs/:id" element={<DesignDetail />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      <BotonChatbot /> {/* Incluir el componente Chatbot */}
      </div>
      <Footer /> {/* Incluye el componente Footer */}
    </Router>
    
  );
}

export default App;