const Film = require("../models/Film");

const addFilm = (req, res, poster, banner) => {
  const {
    title,
    youtubeURL,
    description,
    genre,
    actor,
    titleSearch,
  } = req.body;
  let infoFilm = {
    title,
    youtubeURL,
    description,
    genre,
    actor,
    posterFilm: poster,
    bannerFilm: banner,
    titleSearch,
  };

  for (let prop in infoFilm) {
    if (!infoFilm[prop]) {
      delete infoFilm[prop];
    }
  }

  const newFilm = new Film(infoFilm);

  newFilm.save().then((film) => res.json(film));
};

const updateFilm = async (req, res, poster, banner) => {
  try {
    const {
      title,
      youtubeURL,
      description,
      genre,
      reviews,
      actor,
      titleSearch,
    } = req.body;

    let infoFilm = {
      title,
      youtubeURL,
      description,
      reviews,
      genre,
      actor,
      posterFilm: poster,
      bannerFilm: banner,
      titleSearch,
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
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addFilm,
  updateFilm,
};
