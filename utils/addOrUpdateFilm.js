const Film = require("../models/Film");

const addFilm = (req, res, poster, banner) => {
  const { title, youtubeURL, description, genre, actor, titleSearch, slug } =
    req.body;
  let infoFilm = {
    title,
    youtubeURL,
    description,
    genre,
    actor,
    posterFilm: poster,
    bannerFilm: banner,
    titleSearch,
    slug,
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
      slug,
    } = req.body;
    const currentFilm = await Film.findOne({ slug: req.params.slug });

    let infoFilm = {
      title: title !== currentFilm.title ? title : undefined,
      youtubeURL:
        youtubeURL !== currentFilm.youtubeURL ? youtubeURL : undefined,
      description:
        description !== currentFilm.description ? description : undefined,
      reviews,
      genre:
        genre.join(",") !== currentFilm.genre.join(",") ? genre : undefined,
      actor:
        actor.join(",") !== currentFilm.actor.join(",") ? actor : undefined,
      posterFilm: poster !== currentFilm.posterFilm ? poster : undefined,
      bannerFilm: banner !== currentFilm.bannerFilm ? banner : undefined,
      titleSearch:
        titleSearch !== currentFilm.titleSearch ? titleSearch : undefined,
      slug: slug !== currentFilm.slug ? slug : undefined,
    };

    for (let prop in infoFilm) {
      if (!infoFilm[prop]) {
        delete infoFilm[prop];
      }
    }

    const updateFilm = await Film.findOneAndUpdate(
      { slug: req.params.slug },
      infoFilm,
      {
        new: true,
      }
    );
    await res.json(updateFilm);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addFilm,
  updateFilm,
};
