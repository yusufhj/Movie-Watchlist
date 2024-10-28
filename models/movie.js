const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    poster: String,
    title: {
      type: String,
      required: true,
    },
    genre: String,
    releaseDate: Date,
    director: String,
    status: {
      type: String,
      enum: ['Want to watch', 'Currently watching', 'Watched'],
      default: 'Want to watch',
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  });

module.exports = mongoose.model('Movie', movieSchema);