import React, { useState, useRef, useEffect } from 'react';
import './BotonChatbot.css';

const BotonChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]); // Para almacenar los mensajes del chatbot
    const [inputMessage, setInputMessage] = useState(''); // Para almacenar el mensaje del usuario
    const chatbotRef = useRef(null); // Referencia para la ventana del chatbot
    const [threadId, setThreadId] = useState(null); // Para almacenar el ID del hilo

    // Para cambiar el estado del chatbot y crear un nuevo hilo si no existe
    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        if (!isOpen && !threadId) {
            createThread(); // Crea un nuevo hilo al abrir el chatbot
        }
    };

    // Cerrar el chatbot si se hace clic fuera de él
    const handleClickOutside = (event) => {
        if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Función para crear un nuevo hilo en el backend
    const createThread = async () => {
        try {
            const response = await fetch('http://localhost:4000/thread', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setThreadId(data.threadId); // Guarda el ID del hilo creado
        } catch (error) {
            console.error('Error al crear el hilo:', error);
        }
    };

    // Función para enviar un mensaje al chatbot
    const sendMessage = async (message) => {
        if (!threadId) {
            console.error('Thread ID is missing!');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, threadId }),
            });

            const data = await response.json();

            // Log de la respuesta para depuración
            console.log("Respuesta del asistente:", data);

            // Aquí verificamos cómo se estructura la respuesta de la API
            // Suponiendo que `data.messages` es un array y contiene el primer mensaje en el índice 0
            const assistantMessages = data.messages[0][0].text.value;

            // Actualiza los mensajes en una sola llamada
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: message, sender: 'user' },
                { text: assistantMessages, sender: 'assistant' }, // Añade el primer mensaje del asistente
            ]);
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
        }
    };

    // Controla el cambio del mensaje de entrada del usuario
    const handleInputChange = (event) => {
        setInputMessage(event.target.value);
    };

    // Enviar mensaje cuando el usuario hace clic en enviar
    const handleSend = () => {
        if (inputMessage) {
            sendMessage(inputMessage);
            setInputMessage(''); // Limpia el input después de enviar
        }
    };

    return (
        <div>
            <button
                className="chatbot-button"
                onClick={toggleChatbot}
            >
                <img src='/images/mono.png' alt="Chat" className="chat-icon" />
            </button>

            {isOpen && (
                <div className="chatbot-window" ref={chatbotRef}>
                    <h4>¿Cómo puedo ayudarte?</h4>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <input 
                        type="text" 
                        value={inputMessage} 
                        onChange={handleInputChange} 
                        placeholder="Escribe tu mensaje..." 
                    />
                    <button onClick={handleSend}>Enviar</button>
                </div>
            )}
        </div>
    );
};

export default BotonChatbot;
