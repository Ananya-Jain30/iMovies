const router = require('express').Router();
const Movie = require('../models/Movie');

router.get('/', async (req, res, next) => {
  try {
    const { genre, search } = req.query;
    const filter = {};
    if (genre && genre !== 'All films') filter.genre = genre;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const movies = await Movie.find(filter).sort({ featured: -1, createdAt: -1 }).limit(100);
    res.json(movies);
  } catch (err) { next(err); }
});
router.get('/:id', async (req, res, next) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) return res.status(404).json({ message: 'Movie not found.' });
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    res.json(movie);
  } catch (err) { next(err); }
});
module.exports = router;
