const router = require('express').Router();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { customerName, email, movieId, showId, seats } = req.body;
    if (!String(customerName || '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '')))
      return res.status(400).json({ message: 'A name and valid email are required.' });
    if (!mongoose.isValidObjectId(movieId) || !mongoose.isValidObjectId(showId))
      return res.status(400).json({ message: 'Invalid movie or show.' });
    if (!Array.isArray(seats) || seats.length < 1 || seats.length > 8 ||
        seats.some(s => typeof s !== 'string' || !/^[A-F][1-8]$/.test(s)) ||
        new Set(seats).size !== seats.length)
      return res.status(400).json({ message: 'Choose between 1 and 8 unique valid seats.' });

    let result;
    await session.withTransaction(async () => {
      const movie = await Movie.findById(movieId).session(session);
      const show = await Show.findOne({ _id: showId, movie: movieId }).session(session);
      if (!movie || !show) {
        const err = new Error('Movie or show not found.'); err.status = 404; throw err;
      }
      const taken = seats.filter(seat => show.bookedSeats.includes(seat));
      if (taken.length) {
        const err = new Error(`These seats are no longer available: ${taken.join(', ')}`); err.status = 409; throw err;
      }
      show.bookedSeats.push(...seats);
      await show.save({ session });
      const bookingId = `IM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const [booking] = await Booking.create([{
        bookingId, customerName: String(customerName).trim(), email: String(email).trim().toLowerCase(),
        movie: movie._id, show: show._id, seats, totalAmount: show.price * seats.length
      }], { session });
      result = { bookingId: booking.bookingId, _id: booking._id, customerName: booking.customerName,
        email: booking.email, movie: movie.title, show: show.time, seats: booking.seats,
        totalAmount: booking.totalAmount, status: booking.status };
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  } finally { await session.endSession(); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id }).populate('movie', 'title poster').populate('show', 'time theatre date');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json(booking);
  } catch (err) { next(err); }
});
module.exports = router;
