const express = require('express');
const cors = require('cors');
const axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
console.log('Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.CORS_ALLOWED_PUBLIC
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'api-key']
}));


app.post('/message', async (req, res) => {
    try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
        const contextMessages = req.body.context;
        const userMessage = req.body.message || 'Hello!';

        const search_context = await get_search_context(userMessage);
        const url = `${endpoint}/openai/responses?api-version=2025-04-01-preview`;

        const response = await axios({
            url: url,
            method: 'POST',
            responseType: 'stream',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            data: {
                model: deployment,
                stream: true,
                input: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant. If the answer to the users question has a short, one-line answer, provide that in addition to a more detailed explanation. If the question isn\'t quick and easy to answer, provide don\'t provide a quick answer.'
                    },
                    {
                        role: 'system',
                        content: ' When calculating available holiday days, you must sum the entitlement from ALL completed holiday credit years since the start of employment. Do not confuse the total available days with the rules for scheduling (e.g., the 24-day summer holiday portion). The final answer must be the total accumulated sum.'
                    },
                    {
                        role: 'system',
                        content: `Use the following internal context to answer the users question:\n${search_context}`
                    },
                    ...contextMessages,
                    {
                        role: 'user',
                        content: userMessage
                    }
                ]
            },
        });
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        response.data.on('data', (chunk) => {
            res.write(chunk);
        });
        
        response.data.on('end', () => {
            res.write('data: [DONE]\n\n');
            res.end();
        });

        response.data.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).end();
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Something went wrong');
    }
});

app.post('/message/echo', async (req, res) => {
    const userMessage = req.body.message || 'Hello!';
    await sleep(2000);
    res.json({ reply: userMessage });
});

async function get_search_context(message) {
    const url = `${process.env.AZURE_SEARCH_ENDPOINT}/indexes/${process.env.AZURE_SEARCH_INDEX}/docs/search?api-version=2024-07-01`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_SEARCH_KEY
        },
        body: JSON.stringify({
            search: message,
            top: parseInt(process.env.AZURE_SEARCH_NUMBER_OF_CHUNKS) || 40,
        })
    });
    
    const json = await response.json();
    const data = json.value || [];
    
    const contextText = data
        .map(doc => `${doc.title}\n${doc.content}`)
        .join("\n\n");

    return contextText;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));