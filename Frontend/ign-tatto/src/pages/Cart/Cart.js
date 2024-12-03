import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Checkout from './Checkout';
import jsPDF from 'jspdf';
import cartIcon from '../../assets/carrito.png'; // Aseg

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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    </div>
  );

  if (error) return <Alert variant="danger" className="text-center mt-5">{error}</Alert>;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Container className="my-5  cart-container" >
         <div className="cart-header">
        <h1 className="cart-title"style={{textAlign:'center'}}>
    
          Carrito de Compras
        </h1>
      </div>
      {cartItems.length === 0 ? (
        <Alert variant="info" className="text-center">Tu carrito está vacío</Alert>
      ) : (
        <Row>
          
            {cartItems.map(item => (
              <Card key={item.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <img
                        src={`http://localhost:4000/uploads/${item.image_url}`}
                        alt={item.name}
                        className="img-fluid rounded"
                        style={{ objectFit: 'cover', height: '120px', width: '100%' }}
                      />
                    </Col>
                    <Col md={6}>
                      <h5>{item.name}</h5>
                  
                      <h6 className="mt-2">${item.price}</h6>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId={`quantity-${item.id}`} className="mb-2">
                        <Form.Label>Cantidad</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                          min="1"
                        />
                      </Form.Group>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-100"
                      >
                        Eliminar
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
      
          
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="mb-3">Resumen del Pedido</h4>
                <div className="d-2flex justify-content-between mb-">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total</strong>
                  <strong>${totalAmount.toFixed(2)}</strong>
                </div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceder al pago
                </Button>
              </Card.Body>
            </Card>
         
        </Row>
      )}

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
              <p><strong>ID de Pago:</strong> {receipt.paymentIntentId}</p>
              <h5 className="mt-3 mb-2">Productos:</h5>
              <ul className="list-unstyled">
                {receipt.items.map(item => (
                  <li key={item.id} className="mb-2">
                    <strong>{item.name}</strong> - {item.quantity} x ${item.price}
                  </li>
                ))}
              </ul>
              <h5 className="mt-3">Total: ${receipt.totalAmount.toFixed(2)}</h5>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReceipt(false)}>Cerrar</Button>
          <Button variant="primary" onClick={handleDownloadReceipt}>Descargar Boleta</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Cart;

