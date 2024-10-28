const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const addUserToViews = require('./middleware/addUserToViews');
require('dotenv').config();
require('./config/database');

// Models
const Movie = require('./models/movie');
const Review = require('./models/review');


// Controllers
const authController = require('./controllers/auth');
const watchlistController = require('./controllers/watchlist');
const isSignedIn = require('./middleware/isSignedIn');

const app = express();
// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : '3000';

// MIDDLEWARE

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride('_method'));
// Morgan for logging HTTP requests
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

app.use(addUserToViews);

// Public Routes
app.get('/', async (req, res) => {
  const movies = await Movie.find({});
  res.render('index.ejs', { movies });
});

app.get('/movies/:movieId', async (req, res) => {
  const movie = await Movie.findById(req.params.movieId).populate('reviews');
  const reviews = await Review.find({ movie: req.params.movieId }).populate('user');
  const userReview = reviews.find(review => review.user._id.equals(res.locals.user._id));
  // console.log(movie);
  console.log('review: ',reviews);
  console.log('userReview: ', userReview);
  res.render('show.ejs', { movie, reviews, userReview });
});

app.use('/auth', authController);

// Protected Routes
app.use(isSignedIn);
app.use('/watchlist', watchlistController);


app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The express app is ready on port ${port}!`);
});
