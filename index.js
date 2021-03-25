const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());

const db = process.env.MONGO_URI;
console.log(db);

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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
