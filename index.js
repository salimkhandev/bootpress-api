// api/index.js - Single endpoint with all routes (Vercel ready)
import cors from 'cors';
import express from 'express';

const app = express();

// Configuration
const BASE_URL = 'https://chat.botpress.cloud/c4287bfc-fb81-4f1f-a4cf-21520dcc89c4';
const USER_KEY = process.env.USER_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InByaXNtYWEiLCJpYXQiOjE3NjA3MDA4NzV9.i0aR3YIrIlrCAf_RLo6CN2KArKH6Xi7lINWFu25VQKA';
const DEFAULT_CONVERSATION_ID = 'prismaa';

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Botpress Chat API is running',
        endpoints: ['/api/send-message', '/api/get-messages']
    });
});

// API: Send message to Botpress
app.post('/api/send-message', async (req, res) => {
    const { message, conversationId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const cid = conversationId || DEFAULT_CONVERSATION_ID;

    const url = `${BASE_URL}/messages`;
    const options = {
        method: 'POST',
        headers: {
            'x-user-key': USER_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            payload: {
                type: "text",
                text: message
            },
            conversationId: cid
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// API: Get messages from Botpress (for polling)
app.get('/api/get-messages', async (req, res) => {
    const { conversationId } = req.query;
    const cid = conversationId || DEFAULT_CONVERSATION_ID;
    const url = `${BASE_URL}/conversations/${cid}/messages`;
    const options = {
        method: 'GET',
        headers: {
            'x-user-key': USER_KEY
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Export the Express app as a serverless function
export default app;

// Local run support: if not running in a serverless environment, start a local server
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 API server running locally on http://localhost:${PORT}`);
    });
}
