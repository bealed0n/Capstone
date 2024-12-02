// src/pages/Booking/ReserveHour.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import './ReserveHour.css';

const API_BASE_URL = 'http://localhost:4000'; // Asegúrate de incluir '/api' si tu backend lo tiene

const ReserveHour = () => {
  const [artists, setArtists] = useState([]); // Lista de tatuadores
  const [artistId, setArtistId] = useState(''); // ID del tatuador seleccionado
  const [availableSlots, setAvailableSlots] = useState([]); // Horas disponibles del tatuador
  const [selectedSlot, setSelectedSlot] = useState(''); // Hora seleccionada
  const [success, setSuccess] = useState(null); // Mensaje de éxito
  const [error, setError] = useState(null); // Mensaje de error
  const [loadingArtists, setLoadingArtists] = useState(true); // Estado de carga de tatuadores
  const [loadingSlots, setLoadingSlots] = useState(false); // Estado de carga de horas

  // Función auxiliar para formatear fecha y hora
  const formatDateTime = (date, time) => {
    if (!date || !time) return 'Fecha o hora inválida';

    // Extraer la parte de la fecha (YYYY-MM-DD) del campo 'date'
    const datePart = date.split('T')[0];
    
    // Combinar la fecha con la hora
    const combinedDateTime = `${datePart}T${time}`;
    
    // Crear un objeto Date a partir de la cadena combinada
    const dateTime = new Date(combinedDateTime);
    
    // Verificar si la fecha es válida
    if (isNaN(dateTime.getTime())) return 'Fecha no válida';
    
    // Formatear la fecha a una cadena legible
    return dateTime.toLocaleString();
  };

  // Obtener la lista de tatuadores al montar el componente
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/artists`, { withCredentials: true });
        setArtists(response.data);
        setLoadingArtists(false);
      } catch (err) {
        console.error('Error al obtener la lista de tatuadores:', err);
        setError('No se pudo cargar la lista de tatuadores.');
        setLoadingArtists(false);
      }
    };

    fetchArtists();
  }, []);

  // Obtener horas disponibles al seleccionar un tatuador
  useEffect(() => {
    if (artistId) {
      const fetchAvailableSlots = async () => {
        setLoadingSlots(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/artist/${artistId}`, { withCredentials: true });
          console.log('Horas disponibles:', response.data); // Revisar en consola
          setAvailableSlots(response.data);
          setLoadingSlots(false);
        } catch (err) {
          console.error('Error al obtener horas disponibles:', err);
          if (err.response && err.response.status === 404) {
            setError('Tatuador no encontrado.');
          } else {
            setError('No se pudieron cargar las horas disponibles.');
          }
          setLoadingSlots(false);
        }
      };

      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [artistId]);

  // Función para manejar la reserva de una hora
  const handleReserve = async (e) => {
    e.preventDefault();
    if (!artistId || !selectedSlot) {
      setError('Por favor, selecciona un tatuador y una hora disponible.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/book`, // Usa la ruta correcta según tus rutas backend
        { slotId: selectedSlot },
        { withCredentials: true }
      );
      setSuccess('¡Hora reservada exitosamente!');
      setError(null);
      // Opcional: Actualizar las horas disponibles después de la reserva
      setAvailableSlots((prevSlots) => prevSlots.filter((slot) => slot.id !== selectedSlot));
      setSelectedSlot('');
    } catch (err) {
      console.error('Error al reservar la hora:', err);
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('No se pudo reservar la hora. Inténtalo de nuevo más tarde.');
      }
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Reservar Hora</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loadingArtists ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando tatuadores...</span>
          </Spinner>
        </div>
      ) : (
        <Form onSubmit={handleReserve}>
          {/* Selección del Tatuador */}
          <Form.Group controlId="artistSelect" className="mb-3">
            <Form.Label>Selecciona un Tatuador</Form.Label>
            <Form.Control
              as="select"
              value={artistId}
              onChange={(e) => {
                setArtistId(e.target.value);
                setSelectedSlot(''); // Resetear la hora seleccionada al cambiar de artista
                setSuccess(null); // Resetear mensajes de éxito al cambiar de artista
                setError(null); // Resetear mensajes de error al cambiar de artista
              }}
            >
              <option value="">-- Selecciona un tatuador --</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.username}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {/* Selección de la Hora Disponible */}
          {artistId && (
            <Form.Group controlId="slotSelect" className="mb-3">
              <Form.Label>Selecciona una Hora Disponible</Form.Label>
              {loadingSlots ? (
                <div className="text-center my-3">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando horas...</span>
                  </Spinner>
                </div>
              ) : availableSlots.length > 0 ? (
                <Form.Control
                  as="select"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  <option value="">-- Selecciona una hora --</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {formatDateTime(slot.date, slot.time)}
                    </option>
                  ))}
                </Form.Control>
              ) : (
                <p>No hay horas disponibles para este tatuador.</p>
              )}
            </Form.Group>
          )}

          {/* Botón para Reservar */}
          <Button variant="primary" type="submit" disabled={!artistId || !selectedSlot || loadingSlots}>
            {loadingSlots ? 'Reservando...' : 'Reservar Hora'}
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default ReserveHour;