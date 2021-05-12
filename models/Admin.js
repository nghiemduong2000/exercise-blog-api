const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  loginID: {
    type: String,
    required: true,
  },
  permission: {
    type: Boolean,
    default: true,
  },
  imageAdmin: {
    type: String,
    default:
      "https://res.cloudinary.com/nghiemduong2000/image/upload/v1620266729/Review%20Film%20Project/base/flat_1000x1000_075_f.u2_lnllya.jpg",
  },
  password: {
    type: String,
    required: true,
  },
  lastChangePw: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Admin = mongoose.model("Admin", AdminSchema);
