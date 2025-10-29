const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
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

        const url = `${endpoint}/openai/responses?api-version=2025-04-01-preview`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                model: deployment,
                input: [
                    ...contextMessages,
                    {
                        role: 'user',
                        content: userMessage
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error });
        }

        const assistantMessage = data.output
            ?.find(item => item.type === 'message')
            ?.content?.[0]?.text || 'No response text found';

        res.json({ reply: assistantMessage });
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


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));