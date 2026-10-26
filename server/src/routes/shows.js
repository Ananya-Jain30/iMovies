const router = require('express').Router();
const Show = require('../models/Show');

router.get('/', async (req, res, next) => {
  try {
    if (!req.query.movieId || !/^[0-9a-fA-F]{24}$/.test(req.query.movieId)) return res.json([]);
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const shows = await Show.find({ movie: req.query.movieId, date }).sort({ time: 1 }).lean();
    res.json(shows.map(s => ({
      _id: s._id, time: s.time, theatre: s.theatre, format: s.format, price: s.price,
      bookedSeats: s.bookedSeats || []
    })));
  } catch (err) { next(err); }
});
module.exports = router;
