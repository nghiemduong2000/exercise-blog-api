const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();
const bcrypt = require("bcrypt");

const app = express();
const whitelist = [
  "http://localhost:3000",
  "https://exercises-at-vmo.web.app",
  "https://vmoflix-vn.web.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const db = process.env.MONGO_URI;

// Connect to Mongo
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const { connection } = mongoose;
connection.once("open", () => {
  console.log("Mongo database connection established successfully");
});

app.use("/api/posts", require("./routes/posts"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));
app.use("/api/films", require("./routes/films"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/subscription", require("./routes/subscription"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
