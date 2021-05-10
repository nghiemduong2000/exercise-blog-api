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
      "https://res.cloudinary.com/nghiemduong2000/image/upload/v1620266729/Review%20Film%20Project/base/flat_1000x1000_075_f.u2_lnllya.jpg",
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
  isActive: {
    type: Boolean,
    default: true,
  },
  logoutAll: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index({ userName: "text" });

module.exports = User = mongoose.model("User", UserSchema);
