const express = require('express');
const router = express.Router();

// Models
const Watchlist = require('../models/watchlist');
const Movie = require('../models/movie');
const Review = require('../models/review');

// Index
router.get('/', async (req, res) => {
    const watchlist = await Watchlist.findOne({ user: res.locals.user._id }).populate('movies');
    // console.log('watchlist: ', watchlist);
    if (!watchlist) {
        res.render('watchlist/index.ejs', { movies: [] });
        return;
    } else {
        const movies = watchlist.movies;
        // console.log('movies: ', movies);
        res.render('watchlist/index.ejs', { movies });
    }
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
    if (Watchlist.findOne({ user: res.locals.user._id })) {
        const watchlist = await Watchlist.findOneAndUpdate(
            { user: res.locals.user._id },
            { $push: { movies: movie._id } },
            { new: true, upsert: true }
        );
        console.log(watchlist);
    } else {
        const watchlist = await Watchlist.create({ user: res.locals.user._id, movies: [movie._id] });
        console.log(watchlist);
    }
    console.log(movie);
    res.redirect('/watchlist');
});

// show
router.get('/:movieId', async (req, res) => {
    const movie = await Movie.findById(req.params.movieId).populate('reviews');
    const reviews = await Review.find({ movie: req.params.movieId }).populate('user');
    const userReview = reviews.find(review => review.user._id.equals(res.locals.user._id));
    // console.log(movie);
    console.log('review: ',reviews);
    console.log('userReview: ', userReview);
    res.render('watchlist/show.ejs', { movie, reviews, userReview });
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

// review edit
router.get('/:movieId/review/:reviewId/edit', async (req, res) => {
    const movie = await Movie.findById(req.params.movieId);
    const review = await Review.findById(req.params.reviewId);
    // console.log(review);
    res.render('watchlist/review/edit.ejs', { review, movie });
});

// review put
router.put('/:movieId/review/:reviewId', async (req, res) => {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, req.body);
    // console.log(review);
    res.redirect(`/watchlist/${req.params.movieId}`);
});


module.exports = router;