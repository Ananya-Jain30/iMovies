const mongoose = require('mongoose');
const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  theatre: { type: String, required: true },
  time: { type: String, required: true },
  format: { type: String, default: '2D' },
  date: { type: String, required: true },
  price: { type: Number, min: 0, required: true },
  bookedSeats: { type: [String], default: [] }
}, { timestamps: true });
showSchema.index({ movie: 1, date: 1, time: 1 });
module.exports = mongoose.model('Show', showSchema);
