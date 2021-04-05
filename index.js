const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
dotenv.config();

const app = express();
app.use(
  cors({
    // http://localhost:3000
    // https://exercises-at-vmo.web.app
    origin: 'https://exercises-at-vmo.web.app',
    credentials: true,
  })
);

app.use(express.json());
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
connection.once('open', () => {
  console.log('Mongo database connection established successfully');
});

app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
