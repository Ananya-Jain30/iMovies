const mongoose = require('mongoose');
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  genre: { type: String, required: true },
  language: { type: String, default: 'English' },
  duration: { type: Number, required: true },
  rating: { type: String, default: '8.0' },
  year: { type: Number, default: () => new Date().getFullYear() },
  description: { type: String, default: '' },
  poster: { type: String, default: '' },
  backdrop: { type: String, default: '' },
  price: { type: Number, min: 0, default: 200 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Movie', movieSchema);
