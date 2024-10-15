// src/pages/Cart.js
import React from 'react';

const Cart = ({ cartItems, removeFromCart }) => {
  const total = cartItems.reduce((acc, item) => acc + parseFloat(item.price), 0);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Tu Carrito</h2>
      {cartItems.length === 0 ? (
        <p className="text-center">El carrito está vacío.</p>
      ) : (
        <div>
          <ul className="list-group mb-4">
            {cartItems.map((item, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h5>{item.name}</h5>
                  <p>${item.price}</p>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => removeFromCart(index)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <h3 className="text-right">Total: ${total.toFixed(2)}</h3>
          <button className="btn btn-success btn-block">Proceder al Pago</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
