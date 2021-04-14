const Film = require("../models/Film");

const addFilm = (req, res, url) => {
  const { title, author, content, description, review, genre } = req.body;
  let infoFilm = {
    title,
    author,
    content,
    description,
    review,
    genre,
    imageFilm: url,
  };

  for (let prop in infoFilm) {
    if (!infoFilm[prop]) {
      delete infoFilm[prop];
    }
  }

  const newFilm = new Film(infoFilm);

  newFilm.save().then((film) => res.json(film));
};

const updateFilm = async (req, res, url) => {
  const { title, author, content, description, genre, review } = req.body;
  let infoFilm = {
    title,
    author,
    content,
    description,
    review,
    genre,
    imageFilm: url,
  };

  for (let prop in infoFilm) {
    if (!infoFilm[prop]) {
      delete infoFilm[prop];
    }
  }

  const updateFilm = await Film.findByIdAndUpdate(req.params.id, infoFilm, {
    new: true,
  });
  await res.json(updateFilm);
};

module.exports = {
  addFilm,
  updateFilm,
};
