const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, index: true },
  customerName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, lowercase: true, trim: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: { type: [String], required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });
module.exports = mongoose.model('Booking', bookingSchema);
