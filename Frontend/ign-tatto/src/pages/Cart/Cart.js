// src/pages/Cart/Cart.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Checkout from './Checkout'; // Asegúrate de la ruta correcta
import jsPDF from 'jspdf';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/cart', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCartItems(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el carrito.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    try {
      await axios.put('http://localhost:4000/cart', { cartItemId, quantity }, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchCart();
    } catch (err) {
      setError('Error al actualizar la cantidad.');
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:4000/cart/${cartItemId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchCart();
    } catch (err) {
      setError('Error al eliminar el producto del carrito.');
    }
  };

  const handleCheckoutSuccess = (paymentIntent) => {
    alert('Pago exitoso!');
    // Generar la boleta
    const generatedReceipt = {
      paymentIntentId: paymentIntent.id,
      items: cartItems,
      totalAmount: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    };
    setReceipt(generatedReceipt);
    setShowReceipt(true);
    fetchCart();
    setShowCheckout(false);
  };

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    doc.text('Boleta de Compra', 10, 10);
    doc.text(`ID de Pago: ${receipt.paymentIntentId}`, 10, 20);
    doc.text('Productos:', 10, 30);
    receipt.items.forEach((item, index) => {
      doc.text(`${item.name} - ${item.quantity} x $${item.price}`, 10, 40 + (index * 10));
    });
    doc.text(`Total: $${receipt.totalAmount}`, 10, 40 + (receipt.items.length * 10));
    doc.save('boleta.pdf');
  };

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Carrito de Compras</h1>
      <Row>
        {cartItems.map(item => (
          <Col key={item.id} xs={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Img
                variant="top"
                src={`http://localhost:4000/uploads/${item.image_url}`}
                style={{ height: '200px', objectFit: 'cover' }}
                loading="lazy"
              />
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>{item.description}</Card.Text>
                <Card.Text><strong>Precio:</strong> ${item.price}</Card.Text>
                <Form.Group controlId="quantity">
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                    min="1"
                  />
                </Form.Group>
                <Button variant="danger" onClick={() => handleRemoveFromCart(item.id)} className="mt-2">
                  Eliminar
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {cartItems.length > 0 && (
        <>
          <Row className="mt-4">
            <Col>
              <h3>Total: ${totalAmount}</h3>
              <Button variant="primary" onClick={() => setShowCheckout(true)}>
                Checkout
              </Button>
            </Col>
          </Row>

          <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Proceso de Pago</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Checkout cartItems={cartItems} onSuccess={handleCheckoutSuccess} />
            </Modal.Body>
          </Modal>

          <Modal show={showReceipt} onHide={() => setShowReceipt(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Boleta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {receipt && (
                <div>
                  <p>ID de Pago: {receipt.paymentIntentId}</p>
                  <ul>
                    {receipt.items.map(item => (
                      <li key={item.id}>{item.name} - {item.quantity} x ${item.price}</li>
                    ))}
                  </ul>
                  <p>Total: ${receipt.totalAmount}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowReceipt(false)}>Cerrar</Button>
              <Button variant="primary" onClick={handleDownloadReceipt}>Descargar Boleta</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Cart;