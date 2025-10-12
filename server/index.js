require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const transferRoutes = require('./routes/transfer');

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/transfer', transferRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Spotify Transfer API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

