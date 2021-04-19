const express = require("express");
const Film = require("../models/Film");
const { addFilm, updateFilm } = require("../utils/addOrUpdateFilm");
const Router = express.Router();
const cloudinary = require("../utils/cloudinary");

const createUploader = async (file) => {
  return await cloudinary.uploader.upload(file, {
    upload_preset: "review_film_project",
  });
};

// @route GET films
// @desc Get All Films
// @access Public
Router.get("/", async (req, res) => {
  try {
    const films = await Film.find().sort("-date");
    res.json(films);
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
      content,
      author,
      description,
      genre,
      images,
      isUpload,
    } = req.body;

    if (!title || !content || !author || !description || !genre) {
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
Router.patch("/:id", async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      description,
      genre,
      images,
      isUpload,
    } = req.body;

    if (!title || !content || !author || !description || !genre) {
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

      updateFilm(req, res, file_urls[0].secure_url, file_urls[1].secure_url);
    } else {
      updateFilm(req, res, images[0], images[1]);
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
