// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import TattooPreview from './pages/TattooPreview';
import Register from './pages/Register';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddProduct from './pages/AddProduct';
import Navbar from './components/Navbar';
import ClientRegister from './pages/ClientRegister';
import TattooArtistRegister from './pages/TattooArtistRegister';
import DesignerRegister from './pages/DesignerRegister';
import HumanModel3D from './pages/HumanModel3D';
import Profile from './pages/profile';
import UploadPost from './pages/UploadPost';
import AddReview from './pages/AddReview';
import TattooPosts from './pages/TattooPosts'; // Importar el nuevo componente TattooPosts
import ReviewList from './pages/ReviewList'; // Asegúrate de importar ReviewList
import PrivateRoute from './components/PrivateRoute';
import PostDetails from './pages/PostDetails'; // Importar el nuevo componente PostDetails
import NotFound from './pages/NotFound'; // Importar el nuevo componente NotFound


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
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products-lists" element={<ProductList />} />
        <Route path="/products-lists/:id" element={<ProductDetails addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cartItems={cartItems} removeFromCart={removeFromCart} />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/tattoo_artist/register" element={<TattooArtistRegister />} />
        <Route path="/designer/register" element={<DesignerRegister />} />
        <Route path="/model3d" element={<HumanModel3D />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><UploadPost /></PrivateRoute>} />
        <Route path="/reviews/add/:postId" element={<PrivateRoute><AddReview /></PrivateRoute>} />
        <Route path="/reviews/:postId" element={<ReviewList />} /> {/* Ruta para ver reseñas */}
        <Route path="/posts-list" element={<TattooPosts />} /> {/* Nueva ruta para ver las publicaciones */}
        <Route path="/posts/:id" element={<PostDetails />} /> {/* Nueva ruta para ver los detalles de una publicación */}
        <Route path="*" element={<NotFound />} /> {/* Ruta para la página 404 */}

      </Routes>
    </Router>
  );
}

export default App;