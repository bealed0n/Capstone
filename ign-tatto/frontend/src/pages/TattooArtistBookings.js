// src/pages/TattooArtistBookings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TattooArtistBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/booking/tattoo-artist/bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Error al obtener las reservas:', error);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div>
      <h3>Horas Reservadas</h3>
      <ul>
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <li key={booking.id}>
              Cliente: {booking.client_name} - Fecha y hora: {new Date(booking.available_date).toLocaleString()}
            </li>
          ))
        ) : (
          <p>No hay reservas hasta el momento.</p>
        )}
      </ul>
    </div>
  );
};

export default TattooArtistBookings;
