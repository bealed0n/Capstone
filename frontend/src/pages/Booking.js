// src/pages/Booking.js
import React, { useState } from 'react';
import axios from 'axios';

const Booking = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/bookings', { name, date });
      alert(`Cita reservada para ${name} el ${date}`);
      setName('');
      setDate('');
    } catch (error) {
      console.error('Error al reservar la cita:', error.response.data);
      alert('Error al reservar la cita. Intenta de nuevo.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="text-center">Reservar una Cita</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ingresa tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de la Cita</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Reservar Cita</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
