const express = require('express');
const router = express.Router();

// Models
const Watchlist = require('../models/watchlist');
const Movie = require('../models/movie');
const Review = require('../models/review');
const User = require('../models/user');

// Index
router.get('/', async (req, res) => {
    // console.log("watchlist index route");
    const watchlist = await Watchlist.find({ user: req.session.userId }).populate('movies');
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
    const watchlist = await Watchlist.create({ user: req.session.userId, movies: [movie._id] });
    // console.log(watchlist);
    // console.log(movie);
    res.redirect('/watchlist');
});

// show
router.get('/:movieId', async (req, res) => {
    const movie = await Movie.findById(req.params.movieId).populate('reviews');
    console.log(movie);
    res.render('watchlist/show.ejs', { movie });
});


module.exports = router;