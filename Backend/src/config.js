const { config } = require('dotenv');
config();
const OpenAI = require('openai'); // Asegúrate de instalar openai con npm install openai

const client = new OpenAI({
    apiKey: process.env.SECRET_CHATGPT_KEY, 
});
module.exports = {
    db: {
        user: process.env.user,
        host: process.env.host,
        database: process.env.database,
        password: process.env.password,
        port: process.env.port
    },
    jwtSecret: process.env.jwtSecret,
    client,
    assistantId: process.env.ASSISTANT_ID,
}

