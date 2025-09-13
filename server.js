import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize the Express app
const app = express();
const port = 3000;

// Middleware for parsing JSON bodies and enabling CORS
app.use(express.json());
app.use(cors());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Define the API endpoint for the chat
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, mode } = req.body; // Added 'mode' here
        
        // Ensure prompt is provided
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        let fullPrompt;
        if (mode === 'notes') { // This logic handles both 'all' and 'subject' modes
            // This is the new, improved prompt template
            fullPrompt = `You are a study assistant. Use ONLY the provided notes to answer the question. If the information is not in the notes, respond with "I couldn't find the answer in your notes." Do not make up information.
            
            Notes:
            ${req.body.notesContent}
            
            Question: ${prompt}`;
        } else { // global mode
            // This is the prompt for the global mode
            fullPrompt = prompt;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Send the AI's response back to the frontend
        res.json({ message: text });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'An error occurred while generating content.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
