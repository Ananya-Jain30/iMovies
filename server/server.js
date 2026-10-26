require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const movieRoutes = require('./src/routes/movies');
const authRoutes = require('./src/routes/auth');
const showRoutes = require('./src/routes/shows');
const bookingRoutes = require('./src/routes/bookings');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'iMovies API' }));
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`iMovies API running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
