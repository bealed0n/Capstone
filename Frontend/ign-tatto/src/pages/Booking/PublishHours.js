import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es'; // Importa la localización en español
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './PublishHours.css'; // Asegúrate de crear e importar este archivo CSS

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const PublishHours = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/publish', {
        date,
        time
      }, { withCredentials: true });

      setSuccess('Horas publicadas exitosamente.');
      setError(null);
      setDate('');
      setTime('');
      // Agregar el evento al calendario
      setEvents([...events, { start: new Date(date), end: new Date(date), title: `Hora: ${time}` }]);
    } catch (err) {
      console.error('Error al publicar horas:', err);
      setError('Error al publicar horas. Intenta nuevamente.');
      setSuccess(null);
    }
  };

  const handleSelectSlot = useCallback(
    ({ start }) => {
      const selectedDate = format(start, 'yyyy-MM-dd');
      const selectedTime = format(start, 'HH:mm');
      setDate(selectedDate);
      setTime(selectedTime);
    },
    []
  );

  return (
    <Container className="">
      <h2 className="">Publicar Horas Disponibles</h2>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handlePublish}>
                <Form.Group controlId="date" className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="time" className="mb-3">
                  <Form.Label>Hora</Form.Label>
                  <Form.Control
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">Publicar Horas</Button>
              </Form>
            </Card.Body>
          </Card>
   
          <Card className="shadow-sm">
            <Card.Body>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                onSelectSlot={handleSelectSlot}
                selectable
                views={['month', 'week', 'day']}
                messages={{
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día',
                  today: 'Hoy',
                  previous: 'Anterior',
                  next: 'Siguiente',
                  showMore: total => `+ Ver más (${total})`
                }}
              />
            </Card.Body>
          </Card>

    </Container>
  );
};

export default PublishHours;