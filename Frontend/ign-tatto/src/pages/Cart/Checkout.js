// src/pages/Cart/Checkout.js
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';

const stripePromise = loadStripe('pk_test_51QRFTFHvIkD9pEjPBqwvv6hs8K8H4uSgrGVcvHEq4dUz2MYCwPEuVZIlQSW7gTUjyEKtRtBEeZqCA7uzX9keoPH90098cRxlV0');

const CheckoutForm = ({ cartItems, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const calculateOrderAmount = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) * 100;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    try {
      const { data } = await axios.post(
        'http://localhost:4000/api/payments/create-payment-intent',
        { items: cartItems },
        { withCredentials: true }
      );

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          setError(null);
          setProcessing(false);
          onSuccess(result.paymentIntent);
        }
      }
    } catch (err) {
      setError('Error al procesar el pago.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      <Button variant="primary" type="submit" disabled={!stripe || processing} className="mt-3">
        {processing ? 'Procesando...' : 'Pagar'}
      </Button>
    </form>
  );
};

const Checkout = ({ cartItems, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm cartItems={cartItems} onSuccess={onSuccess} />
    </Elements>
  );
};

export default Checkout;