// src/pages/AvailableTimes.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AvailableTimes = ({ tattooArtistId }) => {
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      try {
        const response = await axios.get(`/booking/available/${tattooArtistId}`);
        setAvailableTimes(response.data);
      } catch (error) {
        console.error('Error al obtener horas disponibles:', error);
      }
    };
    fetchAvailableTimes();
  }, [tattooArtistId]);

  return (
    <div>
      <h3>Horas Disponibles</h3>
      {availableTimes.length > 0 ? (
        availableTimes.map((time) => (
          <div key={time.id}>
            <p>{time.date} a las {time.time}</p>
          </div>
        ))
      ) : (
        <p>No hay horas disponibles.</p>
      )}
    </div>
  );
};

export default AvailableTimes;
