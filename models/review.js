const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: String,
});

module.exports = mongoose.model('Review', reviewSchema);