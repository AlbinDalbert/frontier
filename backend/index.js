const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.post('/message', async (req, res) => {
    try {
        const userMessage = req.body.message || 'Hello!';
        const response = await fetch('https://frontier-llm-backend.openai.azure.com/openai/deployments/gpt-5-mini/chat/completions?api-version=2023-07-01', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.AZURE_OPENAI_API_KEY
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: userMessage }],
                max_tokens: 100
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Something went wrong');
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));