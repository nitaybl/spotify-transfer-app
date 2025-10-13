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
// Increase payload limit to 50MB for large playlists
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/transfer', transferRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Spotify Transfer API is running!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

