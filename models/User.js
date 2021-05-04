const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  imageUser: {
    type: String,
    default:
      "https://res.cloudinary.com/nghiemduong2000/image/upload/v1606204579/Petshop%20Project/base/avatarDefault.png",
  },
  userEmail: {
    type: String,
    required: true,
  },
  userPassword: {
    type: String,
    required: true,
  },
  history: {
    type: Array,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model("User", UserSchema);
