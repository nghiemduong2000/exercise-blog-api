const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const FilmSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  imageFilm: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  review: {
    type: Map,
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Film = mongoose.model("Film", FilmSchema);
