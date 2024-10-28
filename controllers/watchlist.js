const express = require('express');
const router = express.Router();

// Models
const Watchlist = require('../models/watchlist');
const Movie = require('../models/movie');
const Review = require('../models/review');

// Index
router.get('/', async (req, res) => {
    // console.log("watchlist index route");
    const watchlist = await Watchlist.find({ user: res.locals.user._id }).populate('movies');
    // console.log('user id in watchlist: ', res.locals.user._id);
    const movies = await Movie.find();

    // console.log('movies: ', movies);
    res.render('watchlist/index.ejs', { movies });
});

// new
router.get('/new', async (req, res) => {
    res.render('watchlist/new.ejs');
});

// create
router.post('/', async (req, res) => {
    const movieData = req.body;
    console.log(movieData);
    const movie = await Movie.create(req.body);
    const watchlist = await Watchlist.create({ user: res.locals.user._id, movies: [movie._id] });
    // console.log(watchlist);
    // console.log(movie);
    res.redirect('/watchlist');
});

// show
router.get('/:movieId', async (req, res) => {
    const movie = await Movie.findById(req.params.movieId).populate('reviews');
    const reviews = await Review.find({ movie: req.params.movieId }).populate('user');
    // console.log(movie);
    console.log('review: ',reviews);
    res.render('watchlist/show.ejs', { movie, reviews });
});

// edit
router.get('/:movieId/edit', async (req, res) => {
    const movie = await Movie.findById(req.params.movieId);
    // console.log(movie); 
    res.render('watchlist/edit.ejs', { movie });
});

// put
router.put('/:movieId', async (req, res) => {
    const movie = await Movie.findByIdAndUpdate(req.params.movieId, req.body);
    // console.log(movie);
    res.redirect('/watchlist');
});

// deletee
router.delete('/:movieId', async (req, res) => {
    const movie = await Movie.findByIdAndDelete(req.params.movieId);
    // console.log(movie);
    res.redirect('/watchlist');
})

// review new
router.get('/:movieId/review/new', async (req, res) => {
    const movie = await Movie.findById(req.params.movieId);
    res.render('watchlist/review/new.ejs', { movie });
});

// review create
router.post('/:movieId/review', async (req, res) => {
    const review = await Review.create({ user: res.locals.user._id, movie: req.params.movieId, ...req.body });
    // console.log(review);
    res.redirect(`/watchlist/${req.params.movieId}`);
});


module.exports = router;