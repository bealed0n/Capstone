// assistantController.js
const { client, assistantId } = require('../config'); // Importa el cliente y el assistantId desde config

let pollingInterval;

// Función para crear un nuevo hilo
async function createThread() {
    console.log('Creating a new thread...');
    const thread = await client.beta.threads.create(); // Usa el cliente importado
    return thread;
}

// Función para agregar un mensaje al hilo
async function addMessage(threadId, message) {
    console.log('Adding a new message to thread: ' + threadId);
    const response = await client.beta.threads.messages.create(
        threadId,
        {
            role: "user",
            content: message
        }
    );
    return response;
}

// Función para ejecutar el asistente
async function runAssistant(threadId) {
    console.log('Running assistant for thread: ' + threadId);
    const response = await client.beta.threads.runs.create(
        threadId,
        { 
          assistant_id: assistantId // Usa assistantId desde la configuración
        }
    );

    console.log(response);
    return response;
}

// Función para verificar el estado de la ejecución del asistente
async function checkingStatus(res, threadId, runId) {
    try {
        const runObject = await client.beta.threads.runs.retrieve(threadId, runId);
        const status = runObject.status;
        console.log('Current status: ' + status);

        if (status === 'completed') {
            clearInterval(pollingInterval);

            const messagesList = await client.beta.threads.messages.list(threadId);
            let messages = [];

            messagesList.body.data.forEach(message => {
                messages.push(message.content);
            });

            // Verifica si ya se ha enviado una respuesta
            if (!res.headersSent) {
                res.json({ messages });
            }
        }
    } catch (error) {
        console.error('Error checking status:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to check status' });
        }
        clearInterval(pollingInterval); // Asegura que el intervalo se detenga en caso de error
    }
}

// Controlador para abrir un nuevo hilo
const openThread = async (req, res) => {
    try {
        const thread = await createThread();
        res.json({ threadId: thread.id });
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: 'Failed to create thread' });
    }
};

// Controlador para enviar un mensaje y ejecutar el asistente
const sendMessage = async (req, res) => {
    const { message, threadId } = req.body;

    try {
        await addMessage(threadId, message);
        const run = await runAssistant(threadId);
        const runId = run.id;

        // Verificar el estado cada 5 segundos
        pollingInterval = setInterval(async () => {
            await checkingStatus(res, threadId, runId); // Asegúrate de esperar a que checkingStatus termine
        }, 5000);
    } catch (error) {
        console.error('Error sending message:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to send message' });
        }
    }
};

module.exports = {
    openThread,
    sendMessage,
};