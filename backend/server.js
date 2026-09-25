const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GoogleGenAI } = require('@google/genai'); // NOTE: new package — see below
require('dotenv').config()

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const JWT_SECRET = process.env.JWT_SECRET;

// Initialize Gemini (current unified SDK)
const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

// Security Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided.' });

    jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized!' });
        req.userId = decoded.id;
        next();
    });
};

// Route: Register a new user
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: 'User registered successfully!' });
    });
});

// Route: Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ message: 'Invalid Password' });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
        res.status(200).json({ auth: true, token, username: user.username });
    });
});

// Route: Log a workout
app.post('/api/workouts', verifyToken, (req, res) => {
    const { exercise, weight, sets, reps } = req.body;
    db.query('INSERT INTO workouts (user_id, exercise, weight, sets, reps) VALUES (?, ?, ?, ?, ?)', 
    [req.userId, exercise, weight, sets, reps], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: 'Workout logged successfully' });
    });
});

// Route: Get user's workout history
app.get('/api/workouts', verifyToken, (req, res) => {
    db.query('SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC', [req.userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});

// Route: AI Coach using Gemini
app.post('/api/ai/coach', verifyToken, (req, res) => {
    if (!ai) {
        return res.status(503).json({ message: 'AI coach is not configured (missing GEMINI_API_KEY).' });
    }

    db.query(
        'SELECT exercise, weight, sets, reps, date FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 20',
        [req.userId],
        async (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) {
                return res.status(400).json({ message: 'Log a few workouts before asking for a coaching tip.' });
            }

            const log = results
                .map((w) => `${new Date(w.date).toISOString().slice(0, 10)} — ${w.exercise}: ${w.weight} x ${w.sets}x${w.reps}`)
                .join('\n');

            const prompt = `You are a terse, knowledgeable strength coach reviewing a lifter's recent training log. Respond with ONE short paragraph (2-4 sentences, no headers, no lists, no emoji): point out one concrete, specific pattern in the data (progressive overload, a stall on a lift, volume imbalance between exercises, etc.) and one actionable next step. Be direct and specific to the numbers given, not generic advice.\n\nRecent training log (most recent first):\n\n${log}`;

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                const insight = response.text.trim();
                res.status(200).json({ insight });
            } catch (aiErr) {
                console.error('AI coach error:', aiErr);
                res.status(502).json({ message: 'Could not reach the AI coach. Try again shortly.' });
            }
        }
    );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));