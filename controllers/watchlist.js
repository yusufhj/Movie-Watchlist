const express = require('express');
const router = express.Router();

// Models
const Watchlist = require('../models/watchlist');
const Movie = require('../models/movie');
const Review = require('../models/review');
const movie = require('../models/movie');

// Index
router.get('/', async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// new
router.get('/new', async (req, res) => {
    try {
        res.render('watchlist/new.ejs');
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// create
router.post('/', async (req, res) => {
    try {
        const movieData = req.body;
        // console.log(movieData);
        const movie = await Movie.create(req.body);
        if (Watchlist.findOne({ user: res.locals.user._id })) {
            const watchlist = await Watchlist.findOneAndUpdate(
                { user: res.locals.user._id },
                { $push: { movies: movie._id } },
                { new: true, upsert: true }
            );
            // console.log(watchlist);
        } else {
            const watchlist = await Watchlist.create({ user: res.locals.user._id, movies: [movie._id] });
            // console.log(watchlist);
        }
        // console.log(movie);
        res.redirect('/watchlist');
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// show
router.get('/:movieId', async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ user: res.locals.user._id });
        if (!watchlist || !watchlist.movies.includes(req.params.movieId)) {
            res.redirect('/watchlist');
            return;
        }
        const movie = await Movie.findById(req.params.movieId).populate('reviews');
        const reviews = await Review.find({ movie: req.params.movieId }).populate('user');
        const userReview = reviews.find(review => review.user._id.equals(res.locals.user._id));
        // console.log(movie);
        // console.log('review: ',reviews);
        // console.log('userReview: ', userReview);
        res.render('watchlist/show.ejs', { movie, reviews, userReview });
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// edit
router.get('/:movieId/edit', async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ user: res.locals.user._id });
        if (!watchlist || !watchlist.movies.includes(req.params.movieId)) {
            res.redirect('/watchlist');
            return;
        }
        const movie = await Movie.findById(req.params.movieId);
        // console.log(movie); 
        res.render('watchlist/edit.ejs', { movie });
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// put
router.put('/:movieId', async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ user: res.locals.user._id });
        if (!watchlist || !watchlist.movies.includes(req.params.movieId)) {
            res.redirect('/');
            return;
        }
        const movie = await Movie.findByIdAndUpdate(req.params.movieId, req.body);
        // console.log(movie);
        res.redirect('/');
    }
    catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// deletee
router.delete('/:movieId', async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ user: res.locals.user._id });
        if (!watchlist || !watchlist.movies.includes(req.params.movieId)) {
            res.redirect('/watchlist');
            return;
        }
        const movie = await Movie.findByIdAndDelete(req.params.movieId);
        if (movie.reviews.length > 0) {
            // console.log('movie reviews: ', movie.reviews);
            await Review.deleteMany({ movie: req.params.movieId });
        }
        // console.log(movie);
        res.redirect('/watchlist');
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// status update
router.put('/:movieId/status', async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ user: res.locals.user._id });
        if (!watchlist || !watchlist.movies.includes(req.params.movieId)) {
            res.redirect('/watchlist');
            return;
        }
        const movie = await Movie.findById(req.params.movieId);
        movie.status = req.body.status;
        await movie.save();
        // console.log(movie);
        res.redirect(`/watchlist/${req.params.movieId}`);
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// review new
router.get('/:movieId/review/new', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);
        res.render('watchlist/review/new.ejs', { movie });
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// review create
router.post('/:movieId/review', async (req, res) => {
    try {
        const review = await Review.create({ user: res.locals.user._id, movie: req.params.movieId, ...req.body });
        await Movie.findByIdAndUpdate(req.params.movieId, { $push: { reviews: review._id } });
        // console.log(review);
        res.redirect(`/watchlist/${req.params.movieId}`);
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// review edit
router.get('/:movieId/review/:reviewId/edit', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);
        const review = await Review.findById(req.params.reviewId);
        // console.log(review);
        res.render('watchlist/review/edit.ejs', { review, movie });
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});

// review put
router.put('/:movieId/review/:reviewId', async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.reviewId, req.body);
        // console.log(review);
        res.redirect(`/watchlist/${req.params.movieId}`);
    } catch (error) {
        console.log(error);
        res.redirect('/watchlist');
    }
});


module.exports = router;