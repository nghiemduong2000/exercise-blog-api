const express = require("express");
const Film = require("../models/Film");
const { addFilm, updateFilm } = require("../utils/addOrUpdateFilm");
const Router = express.Router();
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");

const createUploader = async (file) => {
  return await cloudinary.uploader.upload(file, {
    upload_preset: "review_film_project",
  });
};

// @route GET amount films
// @desc Get Amount Films
// @access Private
Router.get("/amount", authAdmin, async (req, res) => {
  const amount = await Film.countDocuments();
  res.json(amount);
});

// @route GET film
// @desc Get A Film
// @access Public
Router.get("/", async (req, res) => {
  try {
    const { slug } = req.query;

    const film = await Film.findOne({ slug });
    res.json(film);
  } catch (err) {
    console.log(err);
  }
});

// @route GET films related
// @desc Get Films Related
// @access Public
Router.get("/related", async (req, res) => {
  try {
    const { slug } = req.query;
    const film = await Film.findOne({ slug });
    const related = await Film.find({ genre: { $in: [...film.genre] } }).limit(
      8
    );
    res.json({
      film,
      related,
    });
  } catch (err) {
    console.log(err);
  }
});

// @route GET films filter
// @desc Get Films Filter
// @access Public
Router.get("/filter", async (req, res) => {
  try {
    const { q, genre } = req.query;

    let progress = {};
    if (q) {
      progress.$text = { $search: q };
    }
    if (genre) {
      const checkGenre = typeof genre === "string" ? [genre] : [...genre];
      progress.genre = { $all: checkGenre };
    }

    const filter = q
      ? [{ ...progress }, { score: { $meta: "textScore" } }]
      : [{ ...progress }];

    const films = await Film.find(...filter).sort(
      q ? { score: { $meta: "textScore" } } : "-date"
    );
    res.json(films);
  } catch (err) {
    console.log(err);
  }
});

// @route POST films recent
// @desc POST Films Recent
// @access Private
Router.post("/recent", authUser, async (req, res) => {
  try {
    const { history } = req.body;
    const listIdFilm = history.map((item) =>
      mongoose.Types.ObjectId(item.filmId)
    );
    const films = await Film.find({ _id: { $in: listIdFilm } }).select(
      "title posterFilm youtubeURL genre actor description reviews slug"
    );
    const sortRecent = [];
    for (let i = 0; i < history.length; i++) {
      for (let j = 0; j < films.length; j++) {
        if (history[i].filmId === films[j].id) {
          sortRecent.push(films[j]);
        }
      }
    }
    res.json(sortRecent);
  } catch (err) {
    console.log(err);
  }
});

// @route POST post
// @desc Create A New Post
// @access Public
Router.post("/", async (req, res) => {
  try {
    const {
      title,
      youtubeURL,
      description,
      genre,
      images,
      isUpload,
      titleSearch,
    } = req.body;

    if (!title || !youtubeURL || !description || !genre || !titleSearch) {
      return res.status(400).json({
        msg: "Vui lòng điền vào ô trống",
      });
    }

    if (isUpload === "UPLOAD") {
      let file_urls = [];

      for (let file of images) {
        const response = await createUploader(file);
        file_urls.push(response);
      }

      addFilm(req, res, file_urls[0].secure_url, file_urls[1].secure_url);
    } else {
      addFilm(req, res, images[0], images[1]);
    }
  } catch (err) {
    console.log(err);
  }
});

// @route PATCH post
// @desc UPDATE A Post
// @access Public
Router.patch("/:slug", async (req, res) => {
  try {
    const {
      title,
      youtubeURL,
      description,
      genre,
      images,
      reviews,
      isUpload,
      titleSearch,
    } = req.body;

    if (images) {
      if (!title || !youtubeURL || !description || !genre || !titleSearch) {
        return res.status(400).json({
          msg: "Vui lòng điền vào ô trống",
        });
      }

      if (isUpload) {
        let file_urls = [];
        for (let file of images) {
          if (file) {
            const response = await createUploader(file);
            file_urls.push(response.secure_url);
          } else {
            file_urls.push(file);
          }
        }

        updateFilm(req, res, file_urls[0], file_urls[1]);
      } else {
        updateFilm(req, res, images[0], images[1]);
      }
    } else {
      let infoFilm = {
        reviews,
      };

      for (let prop in infoFilm) {
        if (!infoFilm[prop]) {
          delete infoFilm[prop];
        }
      }

      const updateFilm = await Film.findOneAndUpdate(
        req.params.slug,
        infoFilm,
        {
          new: true,
        }
      );
      await res.json(updateFilm);
    }
  } catch (err) {
    console.log(err);
  }
});

// @route DELETE post
// @desc Remove A Post
// @access Public
Router.delete("/:id", async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    await film.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, err });
  }
});

module.exports = Router;
