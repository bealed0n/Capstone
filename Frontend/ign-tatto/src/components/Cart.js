import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Container, ListGroup, Button } from 'react-bootstrap';

const Cart = () => {
  const { cart, removeFromCart } = useContext(CartContext);

  return (
    <Container className="mt-5">
      <h2>Carrito de Compras</h2>
      {cart.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <ListGroup>
          {cart.map((product) => (
            <ListGroup.Item key={product.id}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{product.name}</h5>
                  <p>${product.price}</p>
                </div>
                <Button variant="danger" onClick={() => removeFromCart(product.id)}>
                  Eliminar
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default Cart;