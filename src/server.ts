import express from 'express';
import cors from 'cors';
import path from 'path';
import { searchOneMap } from './index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// API Endpoint for search
app.get('/api/search', async (req, res) => {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string, 10) || 1;

    if (!query) {
         res.status(400).json({ error: 'Query parameter "q" is required' });
         return; // Ensure the function returns to avoid further execution
    }

    try {
        const results = await searchOneMap(query, page);
        res.json(results);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Serve frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

export default app;
